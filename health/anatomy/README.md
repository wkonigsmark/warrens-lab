# Anatomy Learning System

An interactive learning tool to understand human anatomy. Organized in phases, starting with a comprehensive database of anatomical components.

## Project Phases

### Phase I: Database of Anatomical Components ✅ In Progress
Building a comprehensive, structured database of:
- **Organs** (currently: 15 major organs)
- **Bones** (coming)
- **Muscles** (coming)
- **Ligaments** (coming)
- **Tendons** (coming)
- **Nerves** (coming)
- **Blood vessels** (coming)

Each component includes detailed information like location, function, connections, and system relationships.

### Phase II: Interactive Visual Component
A dynamic, visual interface where students can:
- View human/skeletal diagrams
- Match body parts to their locations
- Interactive highlighting and labeling
- Quiz mode for self-assessment

### Phase III: Workout Integration
Connect anatomy knowledge to:
- Workout planner
- Exercise tracker
- Muscle/body part targeting

### Phase IV: Pre-Med Study Packet
Comprehensive preparation for medical education with advanced features and content.

## Project Structure

```
anatomy/
├── data/
│   └── anatomy.json          # Main database file
├── src/
│   ├── types.ts              # TypeScript type definitions
│   ├── loader.ts             # Data loading and querying system
│   ├── utils.ts              # Formatting and utility functions
│   ├── cli.ts                # Command-line interface
│   ├── index.ts              # Main entry point
│   └── interactive/
│       └── BodyDiagram.ts    # Phase II placeholder (interactive components)
├── dist/                     # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 14+
- TypeScript

### Installation

```bash
cd health/anatomy
npm install
```

### Compilation

```bash
npm run build      # One-time compile
npm run dev        # Watch mode for development
```

## Usage

### Command-Line Interface (CLI)

After building, use the CLI to explore the anatomy database:

```bash
# Show database statistics
npm run cli stats

# List all organs
npm run cli list organ

# Search for a component
npm run cli search heart

# Show detailed information
npm run cli show organ_heart

# Show related components
npm run cli related organ_heart

# Export data
npm run cli export organ
npm run cli export organ csv
```

### Programmatic Usage

```typescript
import { AnatomyLoader, formatComponent } from './src/index';

// Create loader
const loader = new AnatomyLoader('./data/anatomy.json');

// Get all organs
const organs = loader.getByCategory('organ');

// Search
const results = loader.search('heart');

// Get by system
const circulatory = loader.getBySystem('circulatory');

// Get statistics
const stats = loader.getStats();

// Format for display
const formatted = formatComponent(organs[0]);
```

## Data Schema

Each anatomical component has:

```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Common name
  category: string;              // organ, bone, muscle, etc.
  system: string | string[];     // Body system(s)
  location: string;              // Where it's located
  function: string;              // What it does
  details: string;               // Description
  connections?: string[];        // Related structures
  // ... additional properties specific to the component
}
```

## Adding New Content

To add new bones, muscles, etc., edit `data/anatomy.json` and add to the appropriate category array. Follow the existing schema and include:

- Essential: id, name, category, system, location, function
- Recommended: details, connections
- Optional: Additional properties specific to that component type

### Example: Adding a Bone

```json
{
  "id": "bone_femur",
  "name": "Femur (Thighbone)",
  "category": "bone",
  "system": "skeletal",
  "location": "Upper leg between hip and knee",
  "function": "Supports body weight, enables movement",
  "length": "45-50cm in adults",
  "details": "The longest and strongest bone in the human body...",
  "connections": ["pelvis", "tibia", "patella"],
  "strengthScore": 9
}
```

## API Reference

### AnatomyLoader

- `getByCategory(category: string)` - Get all components in a category
- `getBySystem(system: string)` - Get all components in a body system
- `getById(id: string)` - Get a specific component
- `search(query: string)` - Search components
- `getAllComponents()` - Get all components
- `getStats()` - Get database statistics
- `getRelated(componentId: string)` - Get connected components
- `exportCategory(category: string)` - Export category data

### Utilities

- `formatComponent(component)` - Pretty print a component
- `formatAsTable(components)` - Format components as ASCII table
- `formatAsCSV(components)` - Format components as CSV
- `groupBy(items, key)` - Group items by property

### Interactive (Phase II)

- `BodyDiagram` - Manage component placements on diagrams
- `AnatomyQuiz` - Quiz system for self-assessment

## Roadmap

- [x] Database schema and types
- [x] Phase I data: Organs
- [ ] Phase I data: Bones
- [ ] Phase I data: Muscles
- [ ] Phase I data: Ligaments & Tendons
- [ ] Phase II: Interactive diagram viewer
- [ ] Phase II: Quiz system implementation
- [ ] Phase III: Workout integration
- [ ] Phase IV: Pre-med study features

## Contributing

When adding new anatomical components:
1. Research accurate, reliable sources
2. Follow the established schema
3. Include clear, concise descriptions
4. Cross-reference connections to other structures
5. Update stats in the metadata section

## License

MIT

## Next Steps

1. Review the database structure and organ content
2. Plan the bones category and add comprehensive data
3. Begin sketching Phase II interactive components
4. Gather resources for muscles, ligaments, and tendons
