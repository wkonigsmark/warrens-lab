/**
 * Phase II: Interactive Visual Component
 *
 * This module will eventually provide:
 * - A canvas-based or SVG-based human/skeletal diagram
 * - Interactive mapping of anatomical components to body locations
 * - Highlighting and labeling system
 * - Quiz/matching functionality
 *
 * Currently a placeholder for the architecture.
 */

import { AnatomicalComponent } from '../types';

export interface BodyLocation {
  x: number;
  y: number;
  radius?: number;
}

export interface ComponentPlacement {
  component: AnatomicalComponent;
  location: BodyLocation;
  highlighted?: boolean;
  label?: string;
}

export type DiagramType = 'anatomical' | 'skeletal' | 'systems';
export type InteractionMode = 'view' | 'quiz' | 'annotate';

export class BodyDiagram {
  private placements: Map<string, ComponentPlacement> = new Map();
  private diagramType: DiagramType = 'anatomical';
  private mode: InteractionMode = 'view';

  constructor(diagramType: DiagramType = 'anatomical') {
    this.diagramType = diagramType;
  }

  // Add a component placement to the diagram
  addPlacement(componentId: string, placement: ComponentPlacement): void {
    this.placements.set(componentId, placement);
  }

  // Get a placement by component ID
  getPlacement(componentId: string): ComponentPlacement | undefined {
    return this.placements.get(componentId);
  }

  // Get all placements
  getAllPlacements(): ComponentPlacement[] {
    return Array.from(this.placements.values());
  }

  // Highlight a component
  highlight(componentId: string): void {
    const placement = this.placements.get(componentId);
    if (placement) {
      placement.highlighted = true;
    }
  }

  // Clear all highlights
  clearHighlights(): void {
    this.placements.forEach(placement => {
      placement.highlighted = false;
    });
  }

  // Change the interaction mode
  setMode(mode: InteractionMode): void {
    this.mode = mode;
  }

  // Get the current mode
  getMode(): InteractionMode {
    return this.mode;
  }

  // Render to SVG (stub - to be implemented in Phase II)
  renderSVG(): string {
    return `<!-- SVG Render for ${this.diagramType} diagram with ${this.placements.size} components -->`;
  }

  // Export placements as JSON
  exportPlacements(): object {
    const exported: Record<string, any> = {};
    this.placements.forEach((placement, componentId) => {
      exported[componentId] = {
        name: placement.component.name,
        location: placement.location,
        highlighted: placement.highlighted,
        label: placement.label,
      };
    });
    return exported;
  }
}

/**
 * Phase II Quiz System (stub)
 *
 * Will provide:
 * - Random selection of components to identify
 * - Validation of clicked/selected body regions
 * - Scoring and feedback
 * - Multiple difficulty levels
 */
export class AnatomyQuiz {
  private questionPool: AnatomicalComponent[] = [];
  private currentQuestion?: AnatomicalComponent;
  private score: number = 0;
  private answered: number = 0;

  constructor(components: AnatomicalComponent[]) {
    this.questionPool = components;
  }

  nextQuestion(): AnatomicalComponent | undefined {
    if (this.questionPool.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * this.questionPool.length);
    this.currentQuestion = this.questionPool[randomIndex];
    return this.currentQuestion;
  }

  getCurrentQuestion(): AnatomicalComponent | undefined {
    return this.currentQuestion;
  }

  submitAnswer(selectedComponentId: string): boolean {
    if (!this.currentQuestion) return false;

    this.answered++;
    const isCorrect = selectedComponentId === this.currentQuestion.id;

    if (isCorrect) {
      this.score++;
    }

    return isCorrect;
  }

  getScore(): { correct: number; total: number; percentage: number } {
    return {
      correct: this.score,
      total: this.answered,
      percentage: this.answered > 0 ? Math.round((this.score / this.answered) * 100) : 0,
    };
  }

  reset(): void {
    this.score = 0;
    this.answered = 0;
    this.currentQuestion = undefined;
  }
}
