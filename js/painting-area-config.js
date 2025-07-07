// Painting Area Structure Configuration
// Based on Interior/Exterior project type

const PaintingAreaConfig = {
  // INTERIOR PROJECT CONFIGURATION
  interior: {
    // 3.1 Scope Definition
    scopeDefinition: {
      surfacesIncluded: [
        { value: 'walls', label: 'Walls' },
        { value: 'ceilings', label: 'Ceilings' },
        { value: 'trim', label: 'Trim (Baseboards, Crown, Casing, Chair Rail)' },
        { value: 'doors', label: 'Doors' },
        { value: 'windowFrames', label: 'Window Frames & Sills' },
        { value: 'closets', label: 'Closets (Interior Walls)' },
        { value: 'other', label: 'Other', hasTextField: true }
      ],
      surfacesExcluded: [
        { value: 'ceilings', label: 'Ceilings' },
        { value: 'allTrim', label: 'All Trim' },
        { value: 'cabinetry', label: 'Built-in Cabinetry / Bookshelves' },
        { value: 'fireplace', label: 'Fireplace Mantel' },
        { value: 'radiators', label: 'Radiators / HVAC Units' },
        { value: 'other', label: 'Other', hasTextField: true }
      ]
    },
    
    // 3.2 Surface Condition & Preparation
    surfacePreparation: {
      prepLevel: [
        { value: 'standardPrep', label: 'Standard Prep (Clean, Scuff Sand, Fill Nail Holes up to 1/8")' },
        { value: 'caulkCracks', label: 'Caulk Cracks in Trim/Walls' },
        { value: 'minorDrywall', label: 'Minor Drywall Repair (Patches up to 6"x6")' },
        { value: 'majorDrywall', label: 'Major Drywall Repair (Requires separate quote)' },
        { value: 'skimCoating', label: 'Skim Coating (To smooth textured or damaged walls)' },
        { value: 'wallpaperRemoval', label: 'Wallpaper Removal' },
        { value: 'primeStains', label: 'Prime Water/Smoke Stains (Oil or Shellac-based primer)' },
        { value: 'primeRawDrywall', label: 'Prime Raw/New Drywall (PVA or Acrylic Primer)' },
        { value: 'degrease', label: 'Degrease Surfaces (Kitchens/Baths)' }
      ]
    },
    
    // 3.3 Area-Level Application Specifications
    applicationSpecs: {
      applicationMethod: [
        { value: 'brushRoll', label: 'Brush & Roll' },
        { value: 'spray', label: 'Spray' }
      ],
      numberOfCoats: [1, 2, 3]
    },
    
    // 3.4 Surface-Specific Finish Details
    surfaceFinishes: {
      walls: {
        sheen: ['Flat', 'Matte', 'Eggshell', 'Satin']
      },
      ceilings: {
        sheen: ['Flat', 'Matte']
      },
      trim: {
        sheen: ['Satin', 'Semi-Gloss', 'High-Gloss']
      },
      doors: {
        sheen: ['Satin', 'Semi-Gloss', 'High-Gloss']
      },
      windows: {
        sheen: ['Satin', 'Semi-Gloss', 'High-Gloss']
      }
    },
    
    // 3.5 Protection & Handling Plan
    protectionPlan: {
      furnitureHandling: [
        { value: 'clientMoveAll', label: 'Client to move all items out of the area.' },
        { value: 'clientMoveCenter', label: 'Client to move all items to the center of the room.' },
        { value: 'hartzellHeavy', label: 'Hartzell to move heavy items; Client to move breakables/electronics.' }
      ],
      fixtureHandling: [
        { value: 'hartzellRemove', label: 'Hartzell to Remove & Reinstall all plates, covers, and vents.' },
        { value: 'clientResponsible', label: 'Client is responsible for R&R of all light fixtures and window treatments.' }
      ]
    }
  },
  
  // EXTERIOR PROJECT CONFIGURATION
  exterior: {
    // 3.1 Scope Definition
    scopeDefinition: {
      surfacesIncluded: [
        { value: 'siding', label: 'Siding / Stucco / EIFS / Brick' },
        { value: 'trim', label: 'Trim (Corner boards, Window/Door trim)' },
        { value: 'fasciaSoffits', label: 'Fascia & Soffits' },
        { value: 'gutters', label: 'Gutters & Downspouts' },
        { value: 'doors', label: 'Doors (Exterior Face)' },
        { value: 'garageDoors', label: 'Garage Doors' },
        { value: 'shutters', label: 'Shutters' },
        { value: 'decks', label: 'Decks / Porch Floors' },
        { value: 'railings', label: 'Railings & Spindles' },
        { value: 'fences', label: 'Fences / Gates' },
        { value: 'foundationWall', label: 'Foundation Wall' }
      ],
      surfacesExcluded: [
        { value: 'roof', label: 'Roof Surfaces' },
        { value: 'windows', label: 'Windows (Glass & Screens)' },
        { value: 'fixtures', label: 'Light fixtures, Doorbells, Mailboxes' },
        { value: 'deckingSurfaces', label: 'Decking Surfaces' },
        { value: 'brickStone', label: 'Brick/Stone Veneer' }
      ]
    },
    
    // 3.2 Surface Condition & Preparation
    surfacePreparation: {
      prepLevel: [
        { value: 'pressureWashClean', label: 'Pressure Wash to Clean (Low Pressure)' },
        { value: 'pressureWashRemove', label: 'Pressure Wash to Remove Failing Paint (High Pressure)' },
        { value: 'handScrape', label: 'Hand Scrape & Sand all peeling areas.' },
        { value: 'primeWood', label: 'Prime all bare wood with exterior oil/alkyd primer.' },
        { value: 'primeMetal', label: 'Spot Prime metal with DTM primer.' },
        { value: 'caulkJoints', label: 'Caulk joints, seams, and nail holes.' },
        { value: 'woodRepair', label: 'Wood Repair / Replacement (Requires separate quote)' },
        { value: 'treatMildew', label: 'Treat Mildew with appropriate solution.' }
      ]
    },
    
    // 3.3 interiorApplication is null for Exterior projects
    applicationSpecs: null,
    
    // 3.4 Surface-Specific Finish Details
    surfaceFinishes: {
      sidingStucco: {
        sheen: ['Flat', 'Low-Lustre', 'Satin'],
        applicationMethod: ['Spray & Back-Roll', 'Brush & Roll'],
        numberOfCoats: [1, 2]
      },
      trim: {
        sheen: ['Low-Lustre', 'Satin', 'Semi-Gloss'],
        applicationMethod: ['Brush', 'Spray'],
        numberOfCoats: [1, 2]
      },
      fasciaSoffits: {
        sheen: ['Low-Lustre', 'Satin', 'Semi-Gloss'],
        applicationMethod: ['Brush', 'Spray'],
        numberOfCoats: [1, 2]
      },
      doors: {
        sheen: ['Low-Lustre', 'Satin', 'Semi-Gloss'],
        applicationMethod: ['Brush', 'Spray'],
        numberOfCoats: [1, 2]
      },
      decksFloors: {
        productType: ['Solid Stain', 'Semi-Transparent Stain', 'Porch & Floor Enamel'],
        numberOfCoats: [1, 2]
      }
    },
    
    // 3.5 Protection & Handling Plan
    protectionPlan: {
      fixtureHandling: {
        placeholder: 'e.g., "Fixtures to be masked. Shutters to be removed and painted off-site."'
      },
      protectionMethod: {
        placeholder: 'e.g., "Mask all windows, doors, and light fixtures. Cover all landscaping, walkways, and roof edges adjacent to work areas with drop cloths or plastic."'
      }
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaintingAreaConfig;
} else if (typeof window !== 'undefined') {
  window.PaintingAreaConfig = PaintingAreaConfig;
}
