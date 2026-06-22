import { AnatomicalComponent } from './types';

// Format anatomical data for display
export function formatComponent(component: AnatomicalComponent): string {
  let output = `\n${'='.repeat(60)}\n`;
  output += `${component.name.toUpperCase()}\n`;
  output += `${'='.repeat(60)}\n\n`;

  output += `ID: ${component.id}\n`;
  output += `Category: ${component.category}\n`;
  output += `System: ${Array.isArray(component.system) ? component.system.join(', ') : component.system}\n`;
  output += `\nLocation:\n  ${component.location}\n`;
  output += `\nFunction:\n  ${component.function}\n`;
  output += `\nDetails:\n  ${component.details}\n`;

  if (component.connections && component.connections.length > 0) {
    output += `\nConnections:\n`;
    component.connections.forEach(conn => {
      output += `  • ${conn}\n`;
    });
  }

  // Add any additional properties
  const standardKeys = ['id', 'name', 'category', 'system', 'location', 'function', 'details', 'connections'];
  const otherKeys = Object.keys(component).filter(key => !standardKeys.includes(key));

  if (otherKeys.length > 0) {
    output += `\nAdditional Information:\n`;
    otherKeys.forEach(key => {
      const value = component[key];
      if (Array.isArray(value)) {
        output += `  ${key}: ${value.join(', ')}\n`;
      } else if (typeof value === 'object' && value !== null) {
        output += `  ${key}: ${JSON.stringify(value, null, 2).split('\n').join('\n    ')}\n`;
      } else {
        output += `  ${key}: ${value}\n`;
      }
    });
  }

  return output;
}

// Create a simple table view
export function formatAsTable(components: AnatomicalComponent[]): string {
  if (components.length === 0) {
    return 'No components found.';
  }

  const headers = ['Name', 'Category', 'System', 'Location'];
  const rows = components.map(comp => [
    comp.name,
    comp.category,
    Array.isArray(comp.system) ? comp.system.join(', ') : comp.system,
    comp.location.substring(0, 40) + (comp.location.length > 40 ? '...' : ''),
  ]);

  return formatTable(headers, rows);
}

// Format data as CSV
export function formatAsCSV(components: AnatomicalComponent[]): string {
  if (components.length === 0) {
    return '';
  }

  const headers = ['id', 'name', 'category', 'system', 'location', 'function'];
  const rows = components.map(comp => [
    comp.id,
    `"${comp.name}"`,
    comp.category,
    Array.isArray(comp.system) ? comp.system.join(';') : comp.system,
    `"${comp.location}"`,
    `"${comp.function}"`,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Group components by a property
export function groupBy<T>(items: T[], key: keyof T): Map<any, T[]> {
  const groups = new Map<any, T[]>();

  items.forEach(item => {
    const groupKey = item[key];
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  return groups;
}

// Helper to format a simple ASCII table
function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((header, i) =>
    Math.max(
      header.length,
      ...rows.map(row => (row[i] || '').toString().length)
    )
  );

  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';
  const dataRows = rows.map(
    row => '| ' + row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ') + ' |'
  );

  return [separator, headerRow, separator, ...dataRows, separator].join('\n');
}
