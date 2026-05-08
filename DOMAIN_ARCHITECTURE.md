# Warren's Lab: Domain Architecture

This document outlines the strategic organization and categorization of projects within the `warrens-lab-main` ecosystem. The lab is organized into **eight core domains** that group projects by their intended outcome and target audience.

---

## intelligence/
**Focus:** Enterprise-grade data engines, financial modeling, and macro-economic terminals.
- **baby-bloomer**: The Master Hub for macro-economic and terminal reporting.
- **mu-terminal**: High-fidelity data visualization and analysis.
- **real-estate**: Fund modeling and property analysis tools.
- **macro-engine**: Core processing engine for economic indicators.
- **family-finance**: Business & family wealth management.
*Note: This domain is excluded from GitHub syncing due to high compute and local-only database requirements.*

## iq/
**Focus:** Brain-challenging education, mental frameworks, and cognitive development.
- **iq hub**: The central hub for the IQ brand (located at the root of the /iq folder).
- **lexicon**: Etymology and linguistic analysis.
- **chemistry**: Scientific education and modeling.
- **orbis**: Geographic and global data learning.
- **ants-apples**: Pattern recognition and educational logic.
- **stencil**: Design systems and aesthetic education.
- **chronos**: Time management and chronological frameworks.
*Redirects enabled for: /ants-apples, /lexicon, /stencil (Mapping to /iq/...)*

## sports/
**Focus:** Competitive tracking, bracket engines, and sports data analytics.
- **derby**: Horse racing pools and betting logic.
- **dynasty**: Long-term sports league management.
- **march-madness**: Tournament bracket and prediction tools.
- **world-cup**: International sports tournament tracking.

## games/
**Focus:** Classic board games, logic puzzles, and skill-based stimulation.
- **mancala**: Traditional stone-sowing game engine.
- **connect-4**: Spatial logic and strategy.
- **blackjack**: Probability and risk-management simulator.
- **sudoku**: Pure logic and number placement.
- **matching**: Memory and pattern matching.
- **abacus**: Calculation-based logic game.

## health/
**Focus:** Nutrition, physical well-being, and culinary education.
- **chef**: "The Chef" - primary culinary logic and interactive meal tool.
- **recipes**: General nutrition tracking and recipe repository.

## music/
**Focus:** Music theory, audio composition, and sound experiments.
- **music**: Central repository for theory labs and composition tools.

## kids/
**Focus:** Early-stage logic and foundational digital literacy.
- **kids**: General activities and simplified interfaces.
- **kid-code**: Foundational programming concepts for early learners.

## lifestyle/
**Focus:** Design, leisure, and aesthetic exploration.
- **cocktails**: Mixology and social utility.
- **art-gallery**: High-end CSS framing and presentation.
- **fonts**: Typography and design asset management.

---

## Sync & Deployment Strategy
- **Local Git**: Used for internal version control and "Save Points" across all domains.
- **GitHub Sync**: Only non-intelligence domains are synced to GitHub.
- **Netlify**: Deploys the root directory. Top-level redirects are managed via `_redirects` to maintain compatibility with legacy URLs.
