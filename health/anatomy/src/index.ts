// Main entry point for the anatomy learning system

export { AnatomyLoader, createLoader } from './loader';
export { formatComponent, formatAsTable, formatAsCSV, groupBy } from './utils';
export { BodyDiagram, AnatomyQuiz } from './interactive/BodyDiagram';
export type { AnatomicalComponent, AnatomyDatabase, SearchResult, CategoryStats } from './types';
export type { BodyLocation, ComponentPlacement, DiagramType, InteractionMode } from './interactive/BodyDiagram';
