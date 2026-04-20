---
name: imagegen
description: >
  Use when the user invokes /imagegen, asks for a Helioy visual style, wants a
  banner or image prompt shaped by a named design style, or needs available
  design styles listed before choosing one.
---

# Image Generator

This skill generates images based on user requests and a specified visual style. It does not invent a style when none is provided.

## Invocation

Expected shape:

```text
/imagegen <style> [brief]
```

Examples:

```text
/imagegen schematic-teardown banner for @KnowMoreContext
/imagegen schematic-teardown order out of chaos
```

## Routing

1. If the user invokes `/imagegen` with no style, list available styles from `./styles/` and ask them to choose one.
2. If the user provides a style, load the matching file from `./styles/<style>.md`.
3. If the style does not exist, list available styles and ask for a valid style.
4. After loading the style, use it to shape the design concept, image prompt, critique, or iteration requested by the user.

## Available Styles

- `schematic-teardown`: hand drawn mechanical schematic, field notebook teardown, empirical visual metaphor, useful for banners, diagrams, launch visuals, and explanatory systems imagery.
- `living-mechanical-cell`: premium cinematic biotech infrastructure, translucent membrane, machined organelles, two level mechanical relief, useful for Little Organs hero images, product visuals, and high fidelity agent system metaphors.
- `iceberg-operating-plane`: dark cinematic split waterline metaphor, small surface object with large hidden underwater structure, mechanical connector, Helix inspired operating plane, useful for context depth, hidden systems, and infrastructure beneath simple visible action.
- `glass-control-plane`: premium dark glass operating surface, central engine, connected graphite modules, physical conduits, restrained green live signal spine, useful for system maps, agent context, infrastructure control boards, and reusable orchestration visuals.

## Rules

- Require an explicit style before generating or rewriting visual prompts.
- Keep style guidance separate from execution. The style file defines the visual grammar. The current user request defines the subject and output.
- For raster image generation, use the platform image generation capability after the style has been loaded and the design direction is clear.
- For exact text in images, prefer clean plates or blank label areas during image generation, then add final text deterministically afterward when precision matters.
