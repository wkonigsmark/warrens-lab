import { AnatomyDatabase, AnatomicalComponent, SearchResult, CategoryStats } from './types';
import fs from 'fs';
import path from 'path';

export class AnatomyLoader {
  private database: AnatomyDatabase;

  constructor(dataPath?: string) {
    const defaultPath = path.join(__dirname, '../data/anatomy.json');
    const filePath = dataPath || defaultPath;

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      this.database = JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load anatomy database from ${filePath}: ${error}`);
    }
  }

  // Get all components of a specific category
  getByCategory(category: string): AnatomicalComponent[] {
    const allComponents = this.getAllComponents();
    return allComponents.filter(comp => comp.category === category);
  }

  // Get all components in a specific body system
  getBySystem(system: string): AnatomicalComponent[] {
    const allComponents = this.getAllComponents();
    return allComponents.filter(comp => {
      const systems = Array.isArray(comp.system) ? comp.system : [comp.system];
      return systems.includes(system as any);
    });
  }

  // Get a specific component by ID
  getById(id: string): AnatomicalComponent | undefined {
    const allComponents = this.getAllComponents();
    return allComponents.find(comp => comp.id === id);
  }

  // Search components by name (case-insensitive, partial match)
  search(query: string): SearchResult[] {
    const allComponents = this.getAllComponents();
    const lowerQuery = query.toLowerCase();

    return allComponents
      .map(comp => ({
        component: comp,
        score: this.calculateSearchScore(comp, lowerQuery),
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Get all components across all categories
  getAllComponents(): AnatomicalComponent[] {
    const components: AnatomicalComponent[] = [];
    const compObj = this.database.components as any;

    for (const category in compObj) {
      if (Array.isArray(compObj[category])) {
        components.push(...compObj[category]);
      }
    }

    return components;
  }

  // Get statistics about the database
  getStats(): {
    totalComponents: number;
    byCategory: CategoryStats[];
    bySystems: { system: string; count: number }[];
  } {
    const allComponents = this.getAllComponents();
    const categoryMap = new Map<string, Set<string>>();
    const systemMap = new Map<string, number>();

    allComponents.forEach(comp => {
      // Count by category
      if (!categoryMap.has(comp.category)) {
        categoryMap.set(comp.category, new Set());
      }

      // Track systems for this category
      const systems = Array.isArray(comp.system) ? comp.system : [comp.system];
      systems.forEach(sys => {
        categoryMap.get(comp.category)!.add(sys);
      });

      // Count by system
      systems.forEach(sys => {
        systemMap.set(sys, (systemMap.get(sys) || 0) + 1);
      });
    });

    return {
      totalComponents: allComponents.length,
      byCategory: Array.from(categoryMap.entries()).map(([category, systems]) => ({
        category,
        count: allComponents.filter(c => c.category === category).length,
        systems: Array.from(systems),
      })),
      bySystems: Array.from(systemMap.entries())
        .map(([system, count]) => ({ system, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  // Get all related components (anything mentioned in connections)
  getRelated(componentId: string): AnatomicalComponent[] {
    const component = this.getById(componentId);
    if (!component || !component.connections) {
      return [];
    }

    const allComponents = this.getAllComponents();
    const related: AnatomicalComponent[] = [];

    component.connections.forEach(connectionName => {
      const match = allComponents.find(
        comp => comp.name.toLowerCase() === connectionName.toLowerCase() ||
                comp.id.includes(connectionName.toLowerCase())
      );
      if (match) {
        related.push(match);
      }
    });

    return related;
  }

  // Export components for a specific category
  exportCategory(category: string): AnatomicalComponent[] {
    return this.getByCategory(category);
  }

  // Update the in-memory database
  updateDatabase(newData: AnatomyDatabase): void {
    this.database = newData;
  }

  private calculateSearchScore(component: AnatomicalComponent, query: string): number {
    let score = 0;

    // Exact name match gets highest score
    if (component.name.toLowerCase() === query) {
      score += 100;
    }
    // Name starts with query
    else if (component.name.toLowerCase().startsWith(query)) {
      score += 50;
    }
    // Name contains query
    else if (component.name.toLowerCase().includes(query)) {
      score += 25;
    }

    // ID contains query
    if (component.id.toLowerCase().includes(query)) {
      score += 10;
    }

    // Location contains query
    if (component.location?.toLowerCase().includes(query)) {
      score += 5;
    }

    // Function contains query
    if (component.function?.toLowerCase().includes(query)) {
      score += 3;
    }

    return score;
  }
}

// Export convenience functions
export function createLoader(dataPath?: string): AnatomyLoader {
  return new AnatomyLoader(dataPath);
}
