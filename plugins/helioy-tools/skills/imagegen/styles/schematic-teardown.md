# Schematic Teardown

Use this style for visuals that should feel like a careful system teardown:
empirical, mechanical, hand drawn, and precise. The image should look like
someone opened a black box, watched what moved through it, and sketched the
mechanism.

## Core Effect

Make the viewer feel that the system is inspectable.

The preferred visual argument is transformation:

```text
messy inputs -> turbulent mechanism -> ordered outputs
```

For context engineering work, this often becomes:

```text
curated in -> routed through the machine -> curated out
```

The strongest form is order out of chaos. Many irregular sources enter the
machine. The center performs visible sorting, routing, filtering, compression,
repair, or measurement. The output leaves as clean, evenly spaced, precise units
delivered just in time.

## Visual Grammar

- Warm aged paper background.
- Sepia ink linework with subtle watercolor shading.
- Hand drawn technical schematic, patent drawing, field notebook, hardware
  teardown.
- Brass pipes, gauges, valves, screws, plates, gears, brackets, lenses, glass
  viewports, trays, funnels, arrows, and instrument panels.
- Slightly imperfect sketch lines. Controlled irregularity, not sloppy drawing.
- Construction marks only where they support the mechanism.
- No futuristic neon. No glossy corporate polish. No generic cyberpunk.

## Composition Pattern

Use a left to right transformation unless the user asks otherwise.

Left side:

- Messy intake.
- Papers, scraps, diagrams, memory cards, token blocks, wires, retrieval notes,
  source fragments, and small evidence artifacts.
- Input should feel abundant and irregular.

Center:

- Dense mechanism.
- Gears, pipes, gauges, sorting lanes, valves, routing chambers, viewports, and
  overlapping streams.
- The center can be busy. It should read as purposeful turbulence.

Right side:

- Ordered output.
- Clean, evenly spaced units. Straight path, measured arrow, or controlled
  conveyor.
- Output should contrast clearly with the intake. Fewer objects, cleaner rhythm,
  precise spacing.

Far right when useful:

- Blank receiving plate, frame, or inspection panel for later deterministic text.

## Background Discipline

Prefer a clean paper field. The subject may be complex, but the background should
not compete with it.

Use only a few faint dimension marks, schematic ticks, or construction lines.
Avoid dense all over notes unless the user asks for a more chaotic draft.

## Text Handling

Generated text is a risk. Use one readable title plate at most, and only when it
is important to the composition.

For precise production work:

- Generate blank plates, labels, or open areas.
- Add final text afterward with deterministic tools.
- Keep small labels illegible or decorative during generation.

## Prompt Template

```text
Create a [format] in the schematic-teardown style.

Subject: [subject].

Core metaphor: [messy inputs -> turbulent mechanism -> ordered outputs].

Composition:
- Left: [messy intake details].
- Center: [mechanism details].
- Right: [ordered output details].
- Optional far right: [blank receiving plate or final destination].

Style:
- warm aged paper background
- sepia ink linework
- subtle watercolor shading
- hand drawn patent drawing and field notebook teardown
- brass pipes, gears, gauges, screws, valves, arrows, instrument panels
- controlled complexity in the mechanism
- clean negative space in the background

Text handling:
- [one title plate or no readable text]
- keep other labels blank or illegible
- leave room for deterministic text overlay if needed

Avoid:
- futuristic neon
- glossy corporate polish
- social media UI
- unrelated logos
- dense background clutter unless requested
```

## KnowMoreContext Calibration

For `@KnowMoreContext`, the style should carry The Tinkerer identity. The image
should feel curious, empirical, and adult.

Useful motifs:

- raw observations entering as scraps and notes
- transport wires and token blocks
- memory cards and retrieval slips
- a context engine that visibly routes and measures
- ordered just in time context units leaving the machine

Canonical banner idea:

```text
chaotic data sources enter from the left,
the center sorts and routes them through a dense mechanical context engine,
ordered context units leave on the right for just in time delivery to the LLM.
```
