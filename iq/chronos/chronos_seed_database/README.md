
# Chonos

Chonos is a prototype history engine designed to model world history as a structured dataset.

The project begins with a seed database that spans from the Big Bang to modern global events.

## Purpose

This dataset provides the foundational ontology for a future full‑stack history learning platform.

It allows developers to:
• Build interactive timelines
• Query historical events
• Model cause‑and‑effect relationships
• Power educational tools and simulations

## Structure

data/
    chronos_seed_events.csv
    chronos_seed_events.json
    categories.csv
    eras.csv
    relationships.csv

schema/
    chronos_schema.sql

docs/
    data-model.md

## Concept

History is modeled as a graph of events.

Each event has metadata describing:
• time
• geography
• category
• significance

Later versions of Chonos will allow linking events through causal relationships and visualizing them on dynamic timelines.
