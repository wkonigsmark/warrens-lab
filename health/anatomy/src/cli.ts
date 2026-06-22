#!/usr/bin/env node

import { createLoader } from './loader';
import { formatComponent, formatAsTable, formatAsCSV } from './utils';
import path from 'path';

const loader = createLoader(path.join(__dirname, '../data/anatomy.json'));

const command = process.argv[2];
const arg = process.argv[3];

function printUsage() {
  console.log(`
Anatomy Learning System - CLI
=============================

Usage: npm run cli [command] [argument]

Commands:
  stats                    Show database statistics
  list [category]          List all components or components of a category
  search [query]           Search for a component by name
  show [id]                Show detailed information about a component
  related [id]             Show related components
  export [category] [csv]  Export category data (optional: as csv)

Examples:
  npm run cli stats
  npm run cli list organ
  npm run cli search heart
  npm run cli show organ_heart
  npm run cli related organ_heart
  npm run cli export organ
  npm run cli export organ csv
  `);
}

try {
  switch (command) {
    case 'stats': {
      const stats = loader.getStats();
      console.log('\n📊 Anatomy Database Statistics');
      console.log('================================\n');
      console.log(`Total Components: ${stats.totalComponents}\n`);

      console.log('By Category:');
      stats.byCategory.forEach(cat => {
        console.log(`  ${cat.category}: ${cat.count} components (${cat.systems.join(', ')})`);
      });

      console.log('\nBy Body System:');
      stats.bySystems.forEach(sys => {
        console.log(`  ${sys.system}: ${sys.count} components`);
      });
      break;
    }

    case 'list': {
      const category = arg || 'organ';
      const components = arg ? loader.getByCategory(arg) : loader.getAllComponents();

      if (components.length === 0) {
        console.log(`\nNo components found${arg ? ` for category: ${arg}` : ''}.`);
      } else {
        console.log(`\n📋 ${components.length} ${arg || 'Total'} Component(s)\n`);
        console.log(formatAsTable(components));
      }
      break;
    }

    case 'search': {
      if (!arg) {
        console.log('Error: Please provide a search query');
        console.log('Usage: npm run cli search [query]');
        break;
      }

      const results = loader.search(arg);
      if (results.length === 0) {
        console.log(`\nNo results found for "${arg}"`);
      } else {
        console.log(`\n🔍 Search Results for "${arg}": ${results.length} match(es)\n`);
        results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.component.name} (${result.component.category})`);
          console.log(`   Location: ${result.component.location}`);
          console.log(`   Match Score: ${result.score}`);
        });
      }
      break;
    }

    case 'show': {
      if (!arg) {
        console.log('Error: Please provide a component ID');
        console.log('Usage: npm run cli show [id]');
        break;
      }

      const component = loader.getById(arg);
      if (!component) {
        console.log(`\nComponent not found: ${arg}`);
      } else {
        console.log(formatComponent(component));
      }
      break;
    }

    case 'related': {
      if (!arg) {
        console.log('Error: Please provide a component ID');
        console.log('Usage: npm run cli related [id]');
        break;
      }

      const component = loader.getById(arg);
      if (!component) {
        console.log(`\nComponent not found: ${arg}`);
      } else {
        const related = loader.getRelated(arg);
        console.log(`\n🔗 Components Related to "${component.name}"\n`);
        if (related.length === 0) {
          console.log('No related components found.');
        } else {
          console.log(formatAsTable(related));
        }
      }
      break;
    }

    case 'export': {
      if (!arg) {
        console.log('Error: Please provide a category to export');
        console.log('Usage: npm run cli export [category] [csv]');
        break;
      }

      const components = loader.exportCategory(arg);
      if (components.length === 0) {
        console.log(`\nNo components found for category: ${arg}`);
      } else {
        const asCSV = process.argv[4] === 'csv';
        const output = asCSV ? formatAsCSV(components) : JSON.stringify(components, null, 2);

        if (asCSV) {
          const filename = `anatomy_${arg}_${new Date().toISOString().split('T')[0]}.csv`;
          console.log(`\n📄 Exported ${components.length} components to ${filename}\n`);
        } else {
          console.log(`\n📄 Exporting ${components.length} ${arg} component(s)\n`);
        }
        console.log(output);
      }
      break;
    }

    default: {
      if (command) {
        console.log(`Unknown command: ${command}`);
      }
      printUsage();
    }
  }
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
}
