export const idlFactory = ({ IDL }) => {
  const Coordinates = IDL.Record({
    'x' : IDL.Int32,
    'y' : IDL.Int32,
    'z' : IDL.Int32,
  });
  const Dimensions = IDL.Record({
    'width' : IDL.Nat32,
    'height' : IDL.Nat32,
    'depth' : IDL.Nat32,
  });
  const LandType = IDL.Variant({
    'Residential' : IDL.Null,
    'Commercial' : IDL.Null,
    'Industrial' : IDL.Null,
    'Agricultural' : IDL.Null,
    'Entertainment' : IDL.Null,
    'Mixed' : IDL.Null,
  });
  const LandMetadata = IDL.Record({
    'environment' : IDL.Opt(IDL.Text),
    'special_features' : IDL.Vec(IDL.Text),
    'access_roads' : IDL.Vec(IDL.Text),
    'utilities' : IDL.Vec(IDL.Text),
  });
  const LandInfo = IDL.Record({
    'id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'coordinates' : Coordinates,
    'dimensions' : Dimensions,
    'land_type' : LandType,
    'description' : IDL.Text,
    'metadata' : IDL.Opt(LandMetadata),
    'created_at' : IDL.Nat64,
    'last_updated' : IDL.Nat64,
  });
  const LandRegistration = IDL.Record({
    'coordinates' : Coordinates,
    'dimensions' : Dimensions,
    'land_type' : LandType,
    'description' : IDL.Text,
    'metadata' : IDL.Opt(LandMetadata),
  });
  const LandRegistryError = IDL.Variant({
    'LandNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'LandAlreadyExists' : IDL.Null,
    'InvalidCoordinates' : IDL.Null,
    'InvalidDimensions' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
    'LandNotForSale' : IDL.Null,
    'OwnershipError' : IDL.Null,
    'InvalidInput' : IDL.Null,
  });
  const LandRegistryResult = IDL.Variant({
    'Ok' : IDL.Nat64,
    'Err' : LandRegistryError,
  });
  const LandRegistryResult_1 = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : LandRegistryError,
  });
  const MarketplaceListing = IDL.Record({
    'land_id' : IDL.Nat64,
    'seller' : IDL.Principal,
    'price' : IDL.Nat64,
    'listed_at' : IDL.Nat64,
    'land_info' : LandInfo,
  });
  const SearchFilters = IDL.Record({
    'land_type' : IDL.Opt(LandType),
    'min_price' : IDL.Opt(IDL.Nat64),
    'max_price' : IDL.Opt(IDL.Nat64),
    'coordinates_range' : IDL.Opt(IDL.Tuple(Coordinates, Coordinates)),
    'min_area' : IDL.Opt(IDL.Nat32),
    'features' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const LandStatistics = IDL.Record({
    'total_lands' : IDL.Nat64,
    'total_owners' : IDL.Nat64,
    'lands_for_sale' : IDL.Nat64,
    'average_price' : IDL.Opt(IDL.Nat64),
    'total_transactions' : IDL.Nat64,
  });
  const TransactionType = IDL.Variant({
    'Registration' : IDL.Null,
    'Transfer' : IDL.Null,
    'Sale' : IDL.Null,
  });
  const TransactionRecord = IDL.Record({
    'land_id' : IDL.Nat64,
    'from' : IDL.Principal,
    'to' : IDL.Principal,
    'price' : IDL.Opt(IDL.Nat64),
    'transaction_type' : TransactionType,
    'timestamp' : IDL.Nat64,
  });
  
  return IDL.Service({
    'add_admin' : IDL.Func([IDL.Principal], [LandRegistryResult_1], []),
    'backup_lands' : IDL.Func([], [IDL.Vec(LandInfo)], ['query']),
    'buy_land' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'calculate_total_land_area' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_all_lands' : IDL.Func([], [IDL.Vec(LandInfo)], ['query']),
    'get_land' : IDL.Func([IDL.Nat64], [IDL.Opt(LandInfo)], ['query']),
    'get_land_count_by_owner' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'get_land_owner' : IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Principal)], ['query']),
    'get_land_statistics' : IDL.Func([], [LandStatistics], ['query']),
    'get_lands_by_owner' : IDL.Func([IDL.Principal], [IDL.Vec(LandInfo)], ['query']),
    'get_lands_by_type' : IDL.Func([LandType], [IDL.Vec(LandInfo)], ['query']),
    'get_lands_for_sale_by_type' : IDL.Func([LandType], [IDL.Vec(MarketplaceListing)], ['query']),
    'get_lands_near_coordinates' : IDL.Func([Coordinates, IDL.Nat32], [IDL.Vec(LandInfo)], ['query']),
    'get_marketplace_listing' : IDL.Func([IDL.Nat64], [IDL.Opt(MarketplaceListing)], ['query']),
    'get_marketplace_listings' : IDL.Func([], [IDL.Vec(MarketplaceListing)], ['query']),
    'get_next_land_id' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_price_history' : IDL.Func([IDL.Nat64], [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64))], ['query']),
    'get_recent_transactions' : IDL.Func([IDL.Nat64], [IDL.Vec(TransactionRecord)], ['query']),
    'get_total_supply' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_transaction_history' : IDL.Func([IDL.Opt(IDL.Nat64)], [IDL.Vec(TransactionRecord)], ['query']),
    'get_user_transactions' : IDL.Func([IDL.Principal], [IDL.Vec(TransactionRecord)], ['query']),
    'is_admin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'list_for_sale' : IDL.Func([IDL.Nat64, IDL.Nat64], [LandRegistryResult_1], []),
    'register_land' : IDL.Func([LandRegistration], [LandRegistryResult], []),
    'remove_from_sale' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'remove_land' : IDL.Func([IDL.Nat64], [LandRegistryResult_1], []),
    'restore_lands' : IDL.Func([IDL.Vec(LandInfo)], [LandRegistryResult_1], []),
    'search_by_coordinates' : IDL.Func([Coordinates, Coordinates], [IDL.Vec(LandInfo)], ['query']),
    'search_lands' : IDL.Func([SearchFilters], [IDL.Vec(LandInfo)], ['query']),
    'search_marketplace' : IDL.Func([SearchFilters], [IDL.Vec(MarketplaceListing)], ['query']),
    'transfer_land' : IDL.Func([IDL.Nat64, IDL.Principal], [LandRegistryResult_1], []),
    'update_land_metadata' : IDL.Func([IDL.Nat64, LandMetadata], [LandRegistryResult_1], []),
    'verify_land_ownership' : IDL.Func([IDL.Nat64, IDL.Principal], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };