import { virtual_land_registry_backend } from '../declarations/virtual_land_registry_backend';

// API wrapper functions for better error handling and consistency

export const landAPI = {
  // Register new land
  registerLand: async (coordinates, size, price, description = '') => {
    try {
      const result = await virtual_land_registry_backend.register_land(
        coordinates,
        size,
        price,
        description
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to register land:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all lands
  getAllLands: async () => {
    try {
      const result = await virtual_land_registry_backend.get_all_lands();
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to fetch all lands:', error);
      return { success: false, error: error.message };
    }
  },

  // Get specific land by ID
  getLand: async (landId) => {
    try {
      const result = await virtual_land_registry_backend.get_land(landId);
      if (result.length > 0) {
        return { success: true, data: result[0] };
      } else {
        return { success: false, error: 'Land not found' };
      }
    } catch (error) {
      console.error('Failed to fetch land:', error);
      return { success: false, error: error.message };
    }
  },

  // Get lands by owner
  getLandsByOwner: async (owner) => {
    try {
      const result = await virtual_land_registry_backend.get_lands_by_owner(owner);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to fetch lands by owner:', error);
      return { success: false, error: error.message };
    }
  },

  // Transfer land ownership
  transferLand: async (landId, newOwner) => {
    try {
      const result = await virtual_land_registry_backend.transfer_land(landId, newOwner);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to transfer land:', error);
      return { success: false, error: error.message };
    }
  },

  // Get lands for sale
  getLandsForSale: async () => {
    try {
      const allLands = await virtual_land_registry_backend.get_all_lands();
      const forSale = allLands.filter(land => land.for_sale);
      return { success: true, data: forSale };
    } catch (error) {
      console.error('Failed to fetch lands for sale:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle land for sale status (if implemented in backend)
  toggleForSale: async (landId) => {
    try {
      // This would need to be implemented in your backend
      // For now, returning a placeholder
      return { success: false, error: 'Toggle for sale not implemented in backend' };
    } catch (error) {
      console.error('Failed to toggle for sale:', error);
      return { success: false, error: error.message };
    }
  },

  // Purchase land (if implemented in backend)
  purchaseLand: async (landId, buyerPrincipal) => {
    try {
      // This would need to be implemented in your backend
      // For now, returning a placeholder
      return { success: false, error: 'Purchase functionality not implemented in backend' };
    } catch (error) {
      console.error('Failed to purchase land:', error);
      return { success: false, error: error.message };
    }
  }
};

// Utility functions for data formatting and validation
export const utils = {
  // Format principal ID for display
  formatPrincipal: (principal) => {
    if (!principal) return 'Unknown';
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
  },

  // Validate coordinates
  validateCoordinates: (x, y) => {
    return {
      isValid: typeof x === 'number' && typeof y === 'number' && 
               x >= 0 && y >= 0 && x <= 1000 && y <= 1000,
      message: 'Coordinates must be numbers between 0 and 1000'
    };
  },

  // Validate land size
  validateSize: (size) => {
    return {
      isValid: typeof size === 'number' && size > 0 && size <= 100,
      message: 'Size must be a positive number up to 100 square units'
    };
  },

  // Validate price
  validatePrice: (price) => {
    return {
      isValid: typeof price === 'number' && price >= 0,
      message: 'Price must be a non-negative number'
    };
  },

  // Format ICP amount
  formatICP: (amount) => {
    return `${Number(amount).toLocaleString()} ICP`;
  },

  // Calculate total value of lands
  calculateTotalValue: (lands) => {
    return lands.reduce((total, land) => total + Number(land.price), 0);
  },

  // Check if coordinates are already taken
  checkCoordinatesAvailable: async (x, y) => {
    try {
      const allLands = await landAPI.getAllLands();
      if (allLands.success) {
        const occupied = allLands.data.some(land => 
          land.coordinates.x === x && land.coordinates.y === y
        );
        return { available: !occupied };
      }
      return { available: true, error: 'Could not check availability' };
    } catch (error) {
      return { available: true, error: error.message };
    }
  },

  // Generate random coordinates for suggestion
  generateRandomCoordinates: () => {
    return {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000)
    };
  },

  // Sort lands by different criteria
  sortLands: (lands, criteria = 'id') => {
    switch (criteria) {
      case 'price_asc':
        return [...lands].sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return [...lands].sort((a, b) => Number(b.price) - Number(a.price));
      case 'size_asc':
        return [...lands].sort((a, b) => Number(a.size) - Number(b.size));
      case 'size_desc':
        return [...lands].sort((a, b) => Number(b.size) - Number(a.size));
      case 'id':
      default:
        return [...lands].sort((a, b) => Number(a.id) - Number(b.id));
    }
  },

  // Filter lands by criteria
  filterLands: (lands, filters = {}) => {
    return lands.filter(land => {
      // Filter by price range
      if (filters.minPrice !== undefined && Number(land.price) < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && Number(land.price) > filters.maxPrice) {
        return false;
      }

      // Filter by size range
      if (filters.minSize !== undefined && Number(land.size) < filters.minSize) {
        return false;
      }
      if (filters.maxSize !== undefined && Number(land.size) > filters.maxSize) {
        return false;
      }

      // Filter by for sale status
      if (filters.forSale !== undefined && land.for_sale !== filters.forSale) {
        return false;
      }

      // Filter by owner
      if (filters.owner && land.owner !== filters.owner) {
        return false;
      }

      return true;
    });
  }
};