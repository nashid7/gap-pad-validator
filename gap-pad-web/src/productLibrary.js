// Product Library Configuration
// This file can be populated from external Python scripts or manually maintained

export const PRODUCT_LIBRARY = {
  // 3U Board Variants (Actual dimensions: 160mm x 100mm x 25.4mm)
  "3U": {
    width: 160, // mm - actual measurement
    height: 100, // mm - actual measurement
    thickness: 25.4, // mm - actual measurement
    variants: {
      "3U-Basic": {
        name: "3U Basic",
        description: "Standard 3U board with basic thermal management",
        expectedPads: 4,
        padLayout: [
          { x: 0.2, y: 0.2, width: 0.15, height: 0.15, required: true, name: "CPU", color: "#ff6600" },
          { x: 0.8, y: 0.2, width: 0.15, height: 0.15, required: true, name: "GPU", color: "#ff6600" },
          { x: 0.2, y: 0.8, width: 0.15, height: 0.15, required: true, name: "VRM", color: "#ff6600" },
          { x: 0.8, y: 0.8, width: 0.15, height: 0.15, required: true, name: "Chipset", color: "#ff6600" }
        ]
      },
      "3U-HighPower": {
        name: "3U High Power",
        description: "3U board with enhanced thermal management",
        expectedPads: 6,
        padLayout: [
          { x: 0.15, y: 0.15, width: 0.12, height: 0.12, required: true, name: "CPU", color: "#ff6600" },
          { x: 0.85, y: 0.15, width: 0.12, height: 0.12, required: true, name: "GPU", color: "#ff6600" },
          { x: 0.15, y: 0.85, width: 0.12, height: 0.12, required: true, name: "VRM1", color: "#ff6600" },
          { x: 0.85, y: 0.85, width: 0.12, height: 0.12, required: true, name: "VRM2", color: "#ff6600" },
          { x: 0.5, y: 0.5, width: 0.12, height: 0.12, required: true, name: "Chipset", color: "#ff6600" },
          { x: 0.5, y: 0.8, width: 0.12, height: 0.12, required: false, name: "Optional", color: "#ffff00" }
        ]
      },
      "3U-Server": {
        name: "3U Server",
        description: "3U server board with multiple CPU sockets",
        expectedPads: 8,
        padLayout: [
          { x: 0.1, y: 0.2, width: 0.12, height: 0.12, required: true, name: "CPU1", color: "#ff6600" },
          { x: 0.9, y: 0.2, width: 0.12, height: 0.12, required: true, name: "CPU2", color: "#ff6600" },
          { x: 0.1, y: 0.8, width: 0.12, height: 0.12, required: true, name: "GPU1", color: "#ff6600" },
          { x: 0.9, y: 0.8, width: 0.12, height: 0.12, required: true, name: "GPU2", color: "#ff6600" },
          { x: 0.3, y: 0.5, width: 0.12, height: 0.12, required: true, name: "VRM1", color: "#ff6600" },
          { x: 0.7, y: 0.5, width: 0.12, height: 0.12, required: true, name: "VRM2", color: "#ff6600" },
          { x: 0.5, y: 0.3, width: 0.12, height: 0.12, required: true, name: "Chipset1", color: "#ff6600" },
          { x: 0.5, y: 0.7, width: 0.12, height: 0.12, required: true, name: "Chipset2", color: "#ff6600" }
        ]
      }
    }
  },
  
  // 6U Board Variants (Actual dimensions: 160mm x 233mm x 25.4mm)
  "6U": {
    width: 160, // mm - actual measurement
    height: 233, // mm - actual measurement
    thickness: 25.4, // mm - actual measurement
    variants: {
      "6U-Standard": {
        name: "6U Standard",
        description: "Standard 6U board",
        expectedPads: 8,
        padLayout: [
          { x: 0.1, y: 0.1, width: 0.1, height: 0.1, required: true, name: "CPU1", color: "#ff6600" },
          { x: 0.9, y: 0.1, width: 0.1, height: 0.1, required: true, name: "CPU2", color: "#ff6600" },
          { x: 0.1, y: 0.9, width: 0.1, height: 0.1, required: true, name: "GPU1", color: "#ff6600" },
          { x: 0.9, y: 0.9, width: 0.1, height: 0.1, required: true, name: "GPU2", color: "#ff6600" },
          { x: 0.3, y: 0.3, width: 0.1, height: 0.1, required: true, name: "VRM1", color: "#ff6600" },
          { x: 0.7, y: 0.3, width: 0.1, height: 0.1, required: true, name: "VRM2", color: "#ff6600" },
          { x: 0.3, y: 0.7, width: 0.1, height: 0.1, required: true, name: "Chipset1", color: "#ff6600" },
          { x: 0.7, y: 0.7, width: 0.1, height: 0.1, required: true, name: "Chipset2", color: "#ff6600" }
        ]
      },
      "6U-HighDensity": {
        name: "6U High Density",
        description: "6U board with maximum thermal management",
        expectedPads: 12,
        padLayout: [
          { x: 0.05, y: 0.1, width: 0.08, height: 0.08, required: true, name: "CPU1", color: "#ff6600" },
          { x: 0.95, y: 0.1, width: 0.08, height: 0.08, required: true, name: "CPU2", color: "#ff6600" },
          { x: 0.05, y: 0.9, width: 0.08, height: 0.08, required: true, name: "GPU1", color: "#ff6600" },
          { x: 0.95, y: 0.9, width: 0.08, height: 0.08, required: true, name: "GPU2", color: "#ff6600" },
          { x: 0.25, y: 0.25, width: 0.08, height: 0.08, required: true, name: "VRM1", color: "#ff6600" },
          { x: 0.75, y: 0.25, width: 0.08, height: 0.08, required: true, name: "VRM2", color: "#ff6600" },
          { x: 0.25, y: 0.75, width: 0.08, height: 0.08, required: true, name: "VRM3", color: "#ff6600" },
          { x: 0.75, y: 0.75, width: 0.08, height: 0.08, required: true, name: "VRM4", color: "#ff6600" },
          { x: 0.5, y: 0.5, width: 0.08, height: 0.08, required: true, name: "Chipset", color: "#ff6600" },
          { x: 0.5, y: 0.2, width: 0.08, height: 0.08, required: false, name: "Optional1", color: "#ffff00" },
          { x: 0.5, y: 0.8, width: 0.08, height: 0.08, required: false, name: "Optional2", color: "#ffff00" },
          { x: 0.2, y: 0.5, width: 0.08, height: 0.08, required: false, name: "Optional3", color: "#ffff00" }
        ]
      }
    }
  },

  // MXC/XMC Board Variants (Actual dimensions: 143.75mm x 74mm)
  "MXC/XMC": {
    width: 143.75, // mm - actual measurement
    height: 74, // mm - actual measurement
    thickness: 25.4, // mm - assumed similar to 3U/6U
    variants: {
      "MXC-Standard": {
        name: "MXC Standard",
        description: "Standard MXC/XMC board",
        expectedPads: 4,
        padLayout: [
          { x: 0.2, y: 0.2, width: 0.15, height: 0.15, required: true, name: "CPU", color: "#ff6600" },
          { x: 0.8, y: 0.2, width: 0.15, height: 0.15, required: true, name: "GPU", color: "#ff6600" },
          { x: 0.2, y: 0.8, width: 0.15, height: 0.15, required: true, name: "VRM", color: "#ff6600" },
          { x: 0.8, y: 0.8, width: 0.15, height: 0.15, required: true, name: "Chipset", color: "#ff6600" }
        ]
      },
      "MXC-HighPower": {
        name: "MXC High Power",
        description: "MXC/XMC board with enhanced thermal management",
        expectedPads: 6,
        padLayout: [
          { x: 0.15, y: 0.15, width: 0.12, height: 0.12, required: true, name: "CPU", color: "#ff6600" },
          { x: 0.85, y: 0.15, width: 0.12, height: 0.12, required: true, name: "GPU", color: "#ff6600" },
          { x: 0.15, y: 0.85, width: 0.12, height: 0.12, required: true, name: "VRM1", color: "#ff6600" },
          { x: 0.85, y: 0.85, width: 0.12, height: 0.12, required: true, name: "VRM2", color: "#ff6600" },
          { x: 0.5, y: 0.5, width: 0.12, height: 0.12, required: true, name: "Chipset", color: "#ff6600" },
          { x: 0.5, y: 0.8, width: 0.12, height: 0.12, required: false, name: "Optional", color: "#ffff00" }
        ]
      }
    }
  },
  
  // Custom Board Variants (can be added dynamically)
  "Custom": {
    width: 120, // mm
    height: 180, // mm
    thickness: 25.4, // mm
    variants: {
      "Custom-User": {
        name: "Custom Board",
        description: "User-defined custom board layout",
        expectedPads: 0,
        padLayout: [],
        isCustom: true
      }
    }
  }
};

// Function to add custom product from external source
export const addCustomProduct = (productData) => {
  try {
    const { type, variant, data } = productData;
    
    if (!PRODUCT_LIBRARY[type]) {
      PRODUCT_LIBRARY[type] = {
        width: data.width || 100,
        height: data.height || 160,
        thickness: data.thickness || 25.4,
        variants: {}
      };
    }
    
    PRODUCT_LIBRARY[type].variants[variant] = {
      name: data.name || variant,
      description: data.description || `Custom ${type} board`,
      expectedPads: data.expectedPads || 0,
      padLayout: data.padLayout || [],
      isCustom: true,
      ...data
    };
    
    console.log(`Added custom product: ${type} - ${variant}`);
    return true;
  } catch (error) {
    console.error('Error adding custom product:', error);
    return false;
  }
};

// Function to load products from external JSON file
export const loadProductsFromFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const products = await response.json();
    
    Object.keys(products).forEach(type => {
      if (products[type] && products[type].variants) {
        PRODUCT_LIBRARY[type] = products[type];
      }
    });
    
    console.log('Products loaded from external file');
    return true;
  } catch (error) {
    console.error('Error loading products from file:', error);
    return false;
  }
};

// Function to export current library to JSON
export const exportLibraryToJSON = () => {
  return JSON.stringify(PRODUCT_LIBRARY, null, 2);
};

// Function to get product by name
export const getProductByName = (type, variant) => {
  return PRODUCT_LIBRARY[type]?.variants[variant] || null;
};

// Function to list all available products
export const listAllProducts = () => {
  const products = [];
  
  Object.keys(PRODUCT_LIBRARY).forEach(type => {
    Object.keys(PRODUCT_LIBRARY[type].variants).forEach(variant => {
      products.push({
        type,
        variant,
        name: PRODUCT_LIBRARY[type].variants[variant].name,
        description: PRODUCT_LIBRARY[type].variants[variant].description,
        expectedPads: PRODUCT_LIBRARY[type].variants[variant].expectedPads,
        dimensions: `${PRODUCT_LIBRARY[type].width}mm × ${PRODUCT_LIBRARY[type].height}mm × ${PRODUCT_LIBRARY[type].thickness}mm`
      });
    });
  });
  
  return products;
};

export default PRODUCT_LIBRARY;
