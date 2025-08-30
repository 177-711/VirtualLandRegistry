// Helper functions for the Virtual Land Registry application

export const helpers = {
  // Date and time formatting
  formatDate: (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      // Convert nanoseconds to milliseconds if needed
      const date = typeof timestamp === 'bigint' 
        ? new Date(Number(timestamp) / 1000000)
        : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  },

  // Number formatting
  formatNumber: (num, decimals = 0) => {
    if (typeof num !== 'number') num = Number(num);
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  },

  // Currency formatting
  formatCurrency: (amount, currency = 'ICP') => {
    const formatted = helpers.formatNumber(amount, 2);
    return `${formatted} ${currency}`;
  },

  // String truncation
  truncateString: (str, maxLength = 50) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },

  // Principal ID formatting
  shortenPrincipal: (principal, startChars = 6, endChars = 4) => {
    if (!principal || principal.length <= startChars + endChars) return principal;
    return `${principal.substring(0, startChars)}...${principal.substring(principal.length - endChars)}`;
  },

  // Validation helpers
  validation: {
    isValidPrincipal: (principal) => {
      // Basic principal validation - adjust based on IC principal format
      return typeof principal === 'string' && 
             principal.length > 20 && 
             /^[a-z0-9-]+$/.test(principal);
    },

    isValidCoordinate: (coord, min = 0, max = 1000) => {
      return typeof coord === 'number' && 
             coord >= min && 
             coord <= max && 
             Number.isInteger(coord);
    },

    isValidSize: (size, min = 1, max = 100) => {
      return typeof size === 'number' && 
             size >= min && 
             size <= max;
    },

    isValidPrice: (price) => {
      return typeof price === 'number' && 
             price >= 0 && 
             price < Number.MAX_SAFE_INTEGER;
    },

    isValidDescription: (description, maxLength = 500) => {
      return typeof description === 'string' && 
             description.length <= maxLength;
    }
  },

  // Local storage helpers (for caching and user preferences)
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
        return false;
      }
    },

    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return defaultValue;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
        return false;
      }
    },

    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
        return false;
      }
    }
  },

  // Coordinate helpers
  coordinates: {
    // Calculate distance between two points
    calculateDistance: (coord1, coord2) => {
      const dx = coord1.x - coord2.x;
      const dy = coord1.y - coord2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    // Find nearby lands
    findNearbyLands: (targetCoord, allLands, radius = 10) => {
      return allLands.filter(land => {
        const distance = helpers.coordinates.calculateDistance(targetCoord, land.coordinates);
        return distance <= radius;
      });
    },

    // Check if coordinates overlap with existing land
    checkOverlap: (newCoord, newSize, existingLands) => {
      return existingLands.some(land => {
        const distance = helpers.coordinates.calculateDistance(newCoord, land.coordinates);
        const combinedSize = Math.sqrt(newSize) + Math.sqrt(land.size);
        return distance < combinedSize;
      });
    },

    // Generate grid coordinates
    generateGrid: (startX = 0, startY = 0, width = 10, height = 10, spacing = 1) => {
      const coordinates = [];
      for (let x = startX; x < startX + width; x += spacing) {
        for (let y = startY; y < startY + height; y += spacing) {
          coordinates.push({ x, y });
        }
      }
      return coordinates;
    }
  },

  // Error handling helpers
  error: {
    // Extract meaningful error message
    extractMessage: (error) => {
      if (typeof error === 'string') return error;
      if (error?.message) return error.message;
      if (error?.toString) return error.toString();
      return 'An unknown error occurred';
    },

    // Log error with context
    logError: (context, error, additionalData = {}) => {
      console.error(`[${context}] Error:`, {
        error: helpers.error.extractMessage(error),
        additionalData,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Animation and UI helpers
  ui: {
    // Smooth scroll to element
    scrollToElement: (elementId, offset = 0) => {
      const element = document.getElementById(elementId);
      if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    },

    // Copy text to clipboard
    copyToClipboard: async (text) => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return true;
        }
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    },

    // Debounce function calls
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function calls
    throttle: (func, limit) => {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  },

  // Land-specific helpers
  land: {
    // Generate land preview
    generatePreview: (land) => {
      return {
        title: `Virtual Land #${land.id}`,
        subtitle: `${land.size} sq units at (${land.coordinates.x}, ${land.coordinates.y})`,
        price: helpers.formatCurrency(land.price),
        status: land.for_sale ? 'Available' : 'Owned',
        owner: helpers.shortenPrincipal(land.owner)
      };
    },

    // Calculate land value per square unit
    calculateValuePerUnit: (land) => {
      return land.size > 0 ? land.price / land.size : 0;
    },

    // Generate land statistics
    generateStats: (lands) => {
      if (!lands || lands.length === 0) {
        return {
          total: 0,
          forSale: 0,
          totalValue: 0,
          averagePrice: 0,
          averageSize: 0
        };
      }

      const forSale = lands.filter(land => land.for_sale);
      const totalValue = lands.reduce((sum, land) => sum + Number(land.price), 0);
      const totalSize = lands.reduce((sum, land) => sum + Number(land.size), 0);

      return {
        total: lands.length,
        forSale: forSale.length,
        totalValue,
        averagePrice: totalValue / lands.length,
        averageSize: totalSize / lands.length,
        averageValuePerUnit: totalValue / totalSize || 0
      };
    }
  }
};