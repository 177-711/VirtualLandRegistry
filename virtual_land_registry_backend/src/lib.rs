use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

// Type definitions
type LandId = u64;
type Price = u64; // in cycles
type Timestamp = u64;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Coordinates {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Dimensions {
    pub width: u32,
    pub height: u32,
    pub depth: u32,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum LandType {
    Residential,
    Commercial,
    Industrial,
    Agricultural,
    Entertainment,
    Mixed,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LandMetadata {
    pub environment: Option<String>,
    pub special_features: Vec<String>,
    pub access_roads: Vec<String>,
    pub utilities: Vec<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LandInfo {
    pub id: LandId,
    pub owner: Principal,
    pub coordinates: Coordinates,
    pub dimensions: Dimensions,
    pub land_type: LandType,
    pub description: String,
    pub metadata: Option<LandMetadata>,
    pub created_at: Timestamp,
    pub last_updated: Timestamp,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LandRegistration {
    pub coordinates: Coordinates,
    pub dimensions: Dimensions,
    pub land_type: LandType,
    pub description: String,
    pub metadata: Option<LandMetadata>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct MarketplaceListing {
    pub land_id: LandId,
    pub seller: Principal,
    pub price: Price,
    pub listed_at: Timestamp,
    pub land_info: LandInfo,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TransactionRecord {
    pub land_id: LandId,
    pub from: Principal,
    pub to: Principal,
    pub price: Option<Price>,
    pub transaction_type: TransactionType,
    pub timestamp: Timestamp,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum TransactionType {
    Registration,
    Transfer,
    Sale,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LandStatistics {
    pub total_lands: u64,
    pub total_owners: u64,
    pub lands_for_sale: u64,
    pub average_price: Option<Price>,
    pub total_transactions: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct SearchFilters {
    pub land_type: Option<LandType>,
    pub min_price: Option<Price>,
    pub max_price: Option<Price>,
    pub coordinates_range: Option<(Coordinates, Coordinates)>,
    pub min_area: Option<u32>,
    pub features: Option<Vec<String>>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum LandRegistryError {
    LandNotFound,
    Unauthorized,
    LandAlreadyExists,
    InvalidCoordinates,
    InvalidDimensions,
    InsufficientFunds,
    LandNotForSale,
    OwnershipError,
    InvalidInput,
}

type LandRegistryResult<T> = Result<T, LandRegistryError>;

// Storage
thread_local! {
    static LAND_STORAGE: RefCell<HashMap<LandId, LandInfo>> = RefCell::new(HashMap::new());
    static OWNERSHIP_INDEX: RefCell<HashMap<Principal, HashSet<LandId>>> = RefCell::new(HashMap::new());
    static MARKETPLACE: RefCell<HashMap<LandId, MarketplaceListing>> = RefCell::new(HashMap::new());
    static TRANSACTION_HISTORY: RefCell<Vec<TransactionRecord>> = RefCell::new(Vec::new());
    static COORDINATE_INDEX: RefCell<HashMap<(i32, i32, i32), LandId>> = RefCell::new(HashMap::new());
    static NEXT_LAND_ID: RefCell<LandId> = RefCell::new(0);
    static ADMINS: RefCell<HashSet<Principal>> = RefCell::new(HashSet::new());
}

#[init]
fn init() {
    let caller = ic_cdk::caller();
    ADMINS.with(|admins| {
        admins.borrow_mut().insert(caller);
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // In a real implementation, you'd serialize state here
}

#[post_upgrade]
fn post_upgrade() {
    // In a real implementation, you'd deserialize state here
}

// Utility functions
fn validate_coordinates(coords: &Coordinates) -> bool {
    coords.x >= -1000000 && coords.x <= 1000000 &&
    coords.y >= -1000000 && coords.y <= 1000000 &&
    coords.z >= -1000 && coords.z <= 1000
}

fn validate_dimensions(dims: &Dimensions) -> bool {
    dims.width > 0 && dims.width <= 10000 &&
    dims.height > 0 && dims.height <= 10000 &&
    dims.depth > 0 && dims.depth <= 1000
}

fn calculate_land_area(dims: &Dimensions) -> u32 {
    dims.width * dims.height
}

fn coordinates_overlap(
    coords1: &Coordinates,
    dims1: &Dimensions,
    coords2: &Coordinates,
    dims2: &Dimensions,
) -> bool {
    let (x1_min, x1_max) = (coords1.x, coords1.x + dims1.width as i32);
    let (y1_min, y1_max) = (coords1.y, coords1.y + dims1.height as i32);
    let (z1_min, z1_max) = (coords1.z, coords1.z + dims1.depth as i32);

    let (x2_min, x2_max) = (coords2.x, coords2.x + dims2.width as i32);
    let (y2_min, y2_max) = (coords2.y, coords2.y + dims2.height as i32);
    let (z2_min, z2_max) = (coords2.z, coords2.z + dims2.depth as i32);

    !(x1_max <= x2_min || x2_max <= x1_min ||
      y1_max <= y2_min || y2_max <= y1_min ||
      z1_max <= z2_min || z2_max <= z1_min)
}

fn check_land_overlap(
    new_coords: &Coordinates,
    new_dims: &Dimensions,
) -> bool {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values().any(|land| {
            coordinates_overlap(new_coords, new_dims, &land.coordinates, &land.dimensions)
        })
    })
}

// Public functions

#[update]
fn register_land(registration: LandRegistration) -> LandRegistryResult<LandId> {
    let caller = ic_cdk::caller();
    
    // Validate input
    if !validate_coordinates(&registration.coordinates) {
        return Err(LandRegistryError::InvalidCoordinates);
    }
    
    if !validate_dimensions(&registration.dimensions) {
        return Err(LandRegistryError::InvalidDimensions);
    }
    
    if registration.description.trim().is_empty() {
        return Err(LandRegistryError::InvalidInput);
    }
    
    // Check for overlapping land
    if check_land_overlap(&registration.coordinates, &registration.dimensions) {
        return Err(LandRegistryError::LandAlreadyExists);
    }
    
    let land_id = NEXT_LAND_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let now = time();
    let land_info = LandInfo {
        id: land_id,
        owner: caller,
        coordinates: registration.coordinates.clone(),
        dimensions: registration.dimensions.clone(),
        land_type: registration.land_type,
        description: registration.description,
        metadata: registration.metadata,
        created_at: now,
        last_updated: now,
    };
    
    // Store land
    LAND_STORAGE.with(|storage| {
        storage.borrow_mut().insert(land_id, land_info.clone());
    });
    
    // Update ownership index
    OWNERSHIP_INDEX.with(|index| {
        index.borrow_mut()
            .entry(caller)
            .or_insert_with(HashSet::new)
            .insert(land_id);
    });
    
    // Update coordinate index
    COORDINATE_INDEX.with(|index| {
        index.borrow_mut().insert(
            (registration.coordinates.x, registration.coordinates.y, registration.coordinates.z),
            land_id,
        );
    });
    
    // Record transaction
    let transaction = TransactionRecord {
        land_id,
        from: Principal::anonymous(),
        to: caller,
        price: None,
        transaction_type: TransactionType::Registration,
        timestamp: now,
    };
    
    TRANSACTION_HISTORY.with(|history| {
        history.borrow_mut().push(transaction);
    });
    
    Ok(land_id)
}

#[query]
fn get_land(land_id: LandId) -> Option<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().get(&land_id).cloned()
    })
}

#[query]
fn get_all_lands() -> Vec<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values().cloned().collect()
    })
}

#[query]
fn get_land_owner(land_id: LandId) -> Option<Principal> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().get(&land_id).map(|land| land.owner)
    })
}

#[query]
fn get_lands_by_owner(owner: Principal) -> Vec<LandInfo> {
    OWNERSHIP_INDEX.with(|index| {
        let land_ids = index.borrow().get(&owner).cloned().unwrap_or_default();
        LAND_STORAGE.with(|storage| {
            let storage = storage.borrow();
            land_ids.iter()
                .filter_map(|&id| storage.get(&id).cloned())
                .collect()
        })
    })
}

#[update]
fn transfer_land(land_id: LandId, new_owner: Principal) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    // Check if land exists and caller is owner
    let land_info = LAND_STORAGE.with(|storage| {
        storage.borrow().get(&land_id).cloned()
    }).ok_or(LandRegistryError::LandNotFound)?;
    
    if land_info.owner != caller {
        return Err(LandRegistryError::Unauthorized);
    }
    
    if new_owner == caller {
        return Err(LandRegistryError::InvalidInput);
    }
    
    // Remove from marketplace if listed
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow_mut().remove(&land_id);
    });
    
    // Update ownership in land storage
    LAND_STORAGE.with(|storage| {
        if let Some(mut land) = storage.borrow_mut().get_mut(&land_id) {
            land.owner = new_owner;
            land.last_updated = time();
        }
    });
    
    // Update ownership index
    OWNERSHIP_INDEX.with(|index| {
        let mut index = index.borrow_mut();
        
        // Remove from current owner
        if let Some(lands) = index.get_mut(&caller) {
            lands.remove(&land_id);
            if lands.is_empty() {
                index.remove(&caller);
            }
        }
        
        // Add to new owner
        index.entry(new_owner)
            .or_insert_with(HashSet::new)
            .insert(land_id);
    });
    
    // Record transaction
    let transaction = TransactionRecord {
        land_id,
        from: caller,
        to: new_owner,
        price: None,
        transaction_type: TransactionType::Transfer,
        timestamp: time(),
    };
    
    TRANSACTION_HISTORY.with(|history| {
        history.borrow_mut().push(transaction);
    });
    
    Ok(())
}

#[update]
fn list_for_sale(land_id: LandId, price: Price) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    let land_info = LAND_STORAGE.with(|storage| {
        storage.borrow().get(&land_id).cloned()
    }).ok_or(LandRegistryError::LandNotFound)?;
    
    if land_info.owner != caller {
        return Err(LandRegistryError::Unauthorized);
    }
    
    if price == 0 {
        return Err(LandRegistryError::InvalidInput);
    }
    
    let listing = MarketplaceListing {
        land_id,
        seller: caller,
        price,
        listed_at: time(),
        land_info,
    };
    
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow_mut().insert(land_id, listing);
    });
    
    Ok(())
}

#[update]
fn remove_from_sale(land_id: LandId) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    let listing = MARKETPLACE.with(|marketplace| {
        marketplace.borrow().get(&land_id).cloned()
    }).ok_or(LandRegistryError::LandNotForSale)?;
    
    if listing.seller != caller {
        return Err(LandRegistryError::Unauthorized);
    }
    
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow_mut().remove(&land_id);
    });
    
    Ok(())
}

#[update]
fn buy_land(land_id: LandId) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    let listing = MARKETPLACE.with(|marketplace| {
        marketplace.borrow().get(&land_id).cloned()
    }).ok_or(LandRegistryError::LandNotForSale)?;
    
    if listing.seller == caller {
        return Err(LandRegistryError::InvalidInput);
    }
    
    // In a real implementation, you'd handle payment here
    // For now, we'll simulate the purchase
    
    // Transfer ownership
    LAND_STORAGE.with(|storage| {
        if let Some(mut land) = storage.borrow_mut().get_mut(&land_id) {
            land.owner = caller;
            land.last_updated = time();
        }
    });
    
    // Update ownership index
    OWNERSHIP_INDEX.with(|index| {
        let mut index = index.borrow_mut();
        
        // Remove from seller
        if let Some(lands) = index.get_mut(&listing.seller) {
            lands.remove(&land_id);
            if lands.is_empty() {
                index.remove(&listing.seller);
            }
        }
        
        // Add to buyer
        index.entry(caller)
            .or_insert_with(HashSet::new)
            .insert(land_id);
    });
    
    // Remove from marketplace
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow_mut().remove(&land_id);
    });
    
    // Record transaction
    let transaction = TransactionRecord {
        land_id,
        from: listing.seller,
        to: caller,
        price: Some(listing.price),
        transaction_type: TransactionType::Sale,
        timestamp: time(),
    };
    
    TRANSACTION_HISTORY.with(|history| {
        history.borrow_mut().push(transaction);
    });
    
    Ok(())
}

#[query]
fn get_marketplace_listings() -> Vec<MarketplaceListing> {
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow().values().cloned().collect()
    })
}

#[query]
fn get_lands_for_sale_by_type(land_type: LandType) -> Vec<MarketplaceListing> {
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow().values()
            .filter(|listing| {
                matches!(listing.land_info.land_type, ref t if std::mem::discriminant(t) == std::mem::discriminant(&land_type))
            })
            .cloned()
            .collect()
    })
}

#[query]
fn search_lands(filters: SearchFilters) -> Vec<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values()
            .filter(|land| {
                // Filter by land type
                if let Some(ref filter_type) = filters.land_type {
                    if std::mem::discriminant(&land.land_type) != std::mem::discriminant(filter_type) {
                        return false;
                    }
                }
                
                // Filter by area
                if let Some(min_area) = filters.min_area {
                    if calculate_land_area(&land.dimensions) < min_area {
                        return false;
                    }
                }
                
                // Filter by coordinates range
                if let Some((min_coords, max_coords)) = &filters.coordinates_range {
                    if land.coordinates.x < min_coords.x || land.coordinates.x > max_coords.x ||
                       land.coordinates.y < min_coords.y || land.coordinates.y > max_coords.y ||
                       land.coordinates.z < min_coords.z || land.coordinates.z > max_coords.z {
                        return false;
                    }
                }
                
                // Filter by features
                if let Some(ref required_features) = filters.features {
                    if let Some(ref metadata) = land.metadata {
                        for feature in required_features {
                            if !metadata.special_features.iter().any(|f| f.contains(feature)) {
                                return false;
                            }
                        }
                    } else if !required_features.is_empty() {
                        return false;
                    }
                }
                
                true
            })
            .cloned()
            .collect()
    })
}

#[query]
fn search_by_coordinates(min_coords: Coordinates, max_coords: Coordinates) -> Vec<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values()
            .filter(|land| {
                land.coordinates.x >= min_coords.x && land.coordinates.x <= max_coords.x &&
                land.coordinates.y >= min_coords.y && land.coordinates.y <= max_coords.y &&
                land.coordinates.z >= min_coords.z && land.coordinates.z <= max_coords.z
            })
            .cloned()
            .collect()
    })
}

#[query]
fn get_transaction_history(land_id: Option<LandId>) -> Vec<TransactionRecord> {
    TRANSACTION_HISTORY.with(|history| {
        let history = history.borrow();
        match land_id {
            Some(id) => history.iter()
                .filter(|tx| tx.land_id == id)
                .cloned()
                .collect(),
            None => history.clone(),
        }
    })
}

#[query]
fn get_price_history(land_id: LandId) -> Vec<(Timestamp, Price)> {
    TRANSACTION_HISTORY.with(|history| {
        history.borrow().iter()
            .filter(|tx| tx.land_id == land_id && tx.price.is_some())
            .map(|tx| (tx.timestamp, tx.price.unwrap()))
            .collect()
    })
}

#[query]
fn get_land_statistics() -> LandStatistics {
    let total_lands = LAND_STORAGE.with(|storage| storage.borrow().len() as u64);
    let total_owners = OWNERSHIP_INDEX.with(|index| index.borrow().len() as u64);
    let lands_for_sale = MARKETPLACE.with(|marketplace| marketplace.borrow().len() as u64);
    let total_transactions = TRANSACTION_HISTORY.with(|history| history.borrow().len() as u64);
    
    let average_price = if lands_for_sale > 0 {
        MARKETPLACE.with(|marketplace| {
            let total: u64 = marketplace.borrow().values().map(|listing| listing.price).sum();
            Some(total / lands_for_sale)
        })
    } else {
        None
    };
    
    LandStatistics {
        total_lands,
        total_owners,
        lands_for_sale,
        average_price,
        total_transactions,
    }
}

#[query]
fn get_lands_near_coordinates(coords: Coordinates, radius: u32) -> Vec<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values()
            .filter(|land| {
                let dx = (land.coordinates.x - coords.x).abs() as u32;
                let dy = (land.coordinates.y - coords.y).abs() as u32;
                let dz = (land.coordinates.z - coords.z).abs() as u32;
                dx <= radius && dy <= radius && dz <= radius
            })
            .cloned()
            .collect()
    })
}

#[update]
fn update_land_metadata(land_id: LandId, metadata: LandMetadata) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    LAND_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if let Some(land) = storage.get_mut(&land_id) {
            if land.owner != caller {
                return Err(LandRegistryError::Unauthorized);
            }
            land.metadata = Some(metadata);
            land.last_updated = time();
            Ok(())
        } else {
            Err(LandRegistryError::LandNotFound)
        }
    })
}

#[query]
fn get_marketplace_listing(land_id: LandId) -> Option<MarketplaceListing> {
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow().get(&land_id).cloned()
    })
}

#[query]
fn search_marketplace(filters: SearchFilters) -> Vec<MarketplaceListing> {
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow().values()
            .filter(|listing| {
                let land = &listing.land_info;
                
                // Filter by land type
                if let Some(ref filter_type) = filters.land_type {
                    if std::mem::discriminant(&land.land_type) != std::mem::discriminant(filter_type) {
                        return false;
                    }
                }
                
                // Filter by price range
                if let Some(min_price) = filters.min_price {
                    if listing.price < min_price {
                        return false;
                    }
                }
                
                if let Some(max_price) = filters.max_price {
                    if listing.price > max_price {
                        return false;
                    }
                }
                
                // Filter by area
                if let Some(min_area) = filters.min_area {
                    if calculate_land_area(&land.dimensions) < min_area {
                        return false;
                    }
                }
                
                // Filter by coordinates range
                if let Some((min_coords, max_coords)) = &filters.coordinates_range {
                    if land.coordinates.x < min_coords.x || land.coordinates.x > max_coords.x ||
                       land.coordinates.y < min_coords.y || land.coordinates.y > max_coords.y ||
                       land.coordinates.z < min_coords.z || land.coordinates.z > max_coords.z {
                        return false;
                    }
                }
                
                true
            })
            .cloned()
            .collect()
    })
}

#[query]
fn get_user_transactions(user: Principal) -> Vec<TransactionRecord> {
    TRANSACTION_HISTORY.with(|history| {
        history.borrow().iter()
            .filter(|tx| tx.from == user || tx.to == user)
            .cloned()
            .collect()
    })
}

// Admin functions
#[update]
fn add_admin(new_admin: Principal) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    let is_admin = ADMINS.with(|admins| {
        admins.borrow().contains(&caller)
    });
    
    if !is_admin {
        return Err(LandRegistryError::Unauthorized);
    }
    
    ADMINS.with(|admins| {
        admins.borrow_mut().insert(new_admin);
    });
    
    Ok(())
}

#[query]
fn is_admin(user: Principal) -> bool {
    ADMINS.with(|admins| {
        admins.borrow().contains(&user)
    })
}

#[update]
fn remove_land(land_id: LandId) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    
    let is_admin = ADMINS.with(|admins| {
        admins.borrow().contains(&caller)
    });
    
    if !is_admin {
        return Err(LandRegistryError::Unauthorized);
    }
    
    // Remove from all storages
    LAND_STORAGE.with(|storage| {
        storage.borrow_mut().remove(&land_id);
    });
    
    MARKETPLACE.with(|marketplace| {
        marketplace.borrow_mut().remove(&land_id);
    });
    
    // Remove from ownership index
    OWNERSHIP_INDEX.with(|index| {
        let mut index = index.borrow_mut();
        for lands in index.values_mut() {
            lands.remove(&land_id);
        }
        index.retain(|_, lands| !lands.is_empty());
    });
    
    Ok(())
}

// Helper query functions
#[query]
fn get_total_supply() -> u64 {
    LAND_STORAGE.with(|storage| storage.borrow().len() as u64)
}

#[query]
fn get_next_land_id() -> LandId {
    NEXT_LAND_ID.with(|id| *id.borrow())
}

#[query]
fn verify_land_ownership(land_id: LandId, claimed_owner: Principal) -> bool {
    LAND_STORAGE.with(|storage| {
        storage.borrow().get(&land_id)
            .map(|land| land.owner == claimed_owner)
            .unwrap_or(false)
    })
}

// Backup and restore functions for data migration
#[query]
fn backup_lands() -> Vec<LandInfo> {
    let caller = ic_cdk::caller();
    let is_admin = ADMINS.with(|admins| admins.borrow().contains(&caller));
    
    if is_admin {
        LAND_STORAGE.with(|storage| {
            storage.borrow().values().cloned().collect()
        })
    } else {
        Vec::new()
    }
}

#[update]
fn restore_lands(lands: Vec<LandInfo>) -> LandRegistryResult<()> {
    let caller = ic_cdk::caller();
    let is_admin = ADMINS.with(|admins| admins.borrow().contains(&caller));
    
    if !is_admin {
        return Err(LandRegistryError::Unauthorized);
    }
    
    // Clear existing data
    LAND_STORAGE.with(|storage| storage.borrow_mut().clear());
    OWNERSHIP_INDEX.with(|index| index.borrow_mut().clear());
    COORDINATE_INDEX.with(|index| index.borrow_mut().clear());
    
    // Restore lands
    for land in lands {
        LAND_STORAGE.with(|storage| {
            storage.borrow_mut().insert(land.id, land.clone());
        });
        
        OWNERSHIP_INDEX.with(|index| {
            index.borrow_mut()
                .entry(land.owner)
                .or_insert_with(HashSet::new)
                .insert(land.id);
        });
        
        COORDINATE_INDEX.with(|index| {
            index.borrow_mut().insert(
                (land.coordinates.x, land.coordinates.y, land.coordinates.z),
                land.id,
            );
        });
        
        // Update next_land_id if necessary
        NEXT_LAND_ID.with(|next_id| {
            let mut next_id = next_id.borrow_mut();
            if land.id >= *next_id {
                *next_id = land.id + 1;
            }
        });
    }
    
    Ok(())
}

// Additional utility functions for better land management
#[query]
fn get_lands_by_type(land_type: LandType) -> Vec<LandInfo> {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values()
            .filter(|land| std::mem::discriminant(&land.land_type) == std::mem::discriminant(&land_type))
            .cloned()
            .collect()
    })
}

#[query]
fn get_land_count_by_owner(owner: Principal) -> u64 {
    OWNERSHIP_INDEX.with(|index| {
        index.borrow().get(&owner)
            .map(|lands| lands.len() as u64)
            .unwrap_or(0)
    })
}

#[query]
fn get_recent_transactions(limit: u64) -> Vec<TransactionRecord> {
    TRANSACTION_HISTORY.with(|history| {
        let history = history.borrow();
        let start_index = if history.len() > limit as usize {
            history.len() - limit as usize
        } else {
            0
        };
        history[start_index..].to_vec()
    })
}

#[query]
fn calculate_total_land_area() -> u64 {
    LAND_STORAGE.with(|storage| {
        storage.borrow().values()
            .map(|land| calculate_land_area(&land.dimensions) as u64)
            .sum()
    })
}

// Export candid interface
ic_cdk::export_candid!();