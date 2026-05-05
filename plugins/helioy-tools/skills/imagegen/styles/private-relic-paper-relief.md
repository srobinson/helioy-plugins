# Private Relic Paper Relief

Use this style for visuals that should feel like a hand-pressed letterpress
diagram on thick archival vellum. Raised paper relief, not flat illustration,
not 3D render. Each node carries a small painterly relic that holds the meaning.
The image reads as a paper artifact under museum light, deeply embossed,
inspectable, intimate.

## Core Effect

The viewer should feel they are looking at a piece of pressed paper, held in
soft cyan museum light, with each node a shallow recess holding a single
painterly object. Connectors are pressed grooves that carry hairline ink. The
image is tactile and authored, not engineered. State changes read as small
shifts in relief depth, not as iconographic decoration.

The argument is custody. A path of decisions, pressed into paper, with quiet
human warmth at the edges.

## Visual Grammar

- Thick warm archival vellum paper. Hue near 80, low chroma, high lightness.
  Visible grain, soft deckle edge if the composition allows.
- Letterpress relief. Nodes sit in shallow paper recesses or rise slightly above
  the field. Soft cast shadows from a single raking light.
- Pale cyan privacy light from above-left. Drawn from a museum case lamp.
- Soft amber catchlight at one edge, marking implied human presence. Never a
  pictured person. Never a hand.
- Hairline ink. Dark graphite-indigo, hue 270, low chroma. Slight imperfection
  from the press impression.
- Each node is a small painterly relic in shallow paper relief. The relic
  carries the meaning of the step. Examples below.
- Connectors between nodes are pressed grooves carrying a single hairline. State
  changes mark with a subtle shift in groove depth or a small pressed stamp
  impression at the transition.
- Negative space is deep vellum. The page should breathe.
- One halo is permitted per composition. Pale cyan or soft amber. Never both at
  the same intensity. Off-center origin.

## Composition Pattern

Default flow charts run top-to-bottom or left-to-right. The user can request
otherwise.

- The entry node sits slightly larger or with a deeper relief impression.
- Each subsequent node is set evenly, paper relief consistent.
- Branching paths split the groove cleanly. Both branches read as equal weight
  unless the user requests a primary path.
- Terminal states sit slightly recessed, marked by a pressed stamp impression
  (think wax seal pressed into paper, not a literal wax seal).
- One small relic per node. Two only if the node is a hub or junction.

## Background Discipline

The vellum field carries the image. No texture overload. Allow the grain to
read. Allow a soft paper edge if the format permits.

A single halo bloom at one corner is permitted. Off-center, asymmetric, low
intensity unless the composition calls for warmth.

No background patterns. No schematic ticks. No grid lines. The paper is enough.

## Text Handling

No readable text in the image. Plates are blank. Tags are blank. If a heading
plate is needed, leave a blank pressed area for deterministic text overlay
later.

Numerical marks at nodes (1, 2, 3) may be pressed in mono if they support
reading the flow, but keep them faint and small.

## Prompt Template

```text
Create a [format] in the private-relic-paper-relief style.

Subject: [the workflow or system being charted].

Composition:
- direction: [left-to-right or top-to-bottom]
- entry node: [first step with its relic object]
- nodes: [each subsequent node with its small relic object]
- connectors: pressed paper grooves between nodes carrying hairline ink
- branches: [list any branching points and their alternative paths]
- terminal states: [end states, pressed stamp impression]

Style:
- thick warm archival vellum paper, hue 80, low chroma, visible grain
- letterpress relief: nodes in shallow paper recesses with soft cast shadows
- pale cyan raking light from above-left, museum case quality
- soft amber catchlight at one edge, no pictured person
- hairline graphite-indigo ink, slight press imperfection
- each node is a small painterly relic object in shallow paper relief
- one halo of pale cyan or amber at one corner, off-center, low intensity
- editorial restraint, museum light, tactile finish

Text handling:
- no readable text in the image
- plates blank, tags blank
- leave space for deterministic text overlay if needed
- faint numerical marks permitted at nodes if supportive

Avoid:
- 3D extrusion or perspective renders
- glossy gradients
- flat vector illustration shapes
- clip art icons
- literal locks, vault doors, coins, blockchain grids, hacker screens
- skulls, coffins, tombstones, death certificates, legal paperwork
- futuristic neon
- generic schematic ticks or grid background
- saturated color
- pictured people, hands, phones, dashboards
```

## OMG Calibration

For the OMG You're Dead engagement, the relics are the product nouns made
tactile. Each relic should carry the meaning of its step without needing a
label.

Relic vocabulary, mapped to product nouns:

- atlas: folded archival map, edges worn
- entry: folded card or pressed leaf, single fold visible
- keep: pressed pin or small tab
- erase: struck-through line in ink, single firm stroke
- transfer: pair of soft circles with arrow groove pressed between them
- keeper: small candle, lantern, or single dot of warm light
- recipient: ajar door, paper hinge implied
- fixer: compass rose pressed into paper
- review: looped ribbon
- note: sealed envelope, blank face
- lock: keyhole, archival not industrial
- pending: blank tag with thread
- accepted: pressed stamp impression, faint wax echo
- revoked: cut thread, frayed edge
- inactive: dimmed pressed circle
- invitation: small folded paper sealed with thread

Halo intensity guidance:

- whisper for ambient flows or background diagrams
- default for hero flow charts or section openers
- loud only when the composition explicitly requires human warmth, such as a
  keeper accepting an invitation or an owner revisiting their atlas

Color discipline mirrors the BRAND.md vellum and graphite system. Never
saturated. Never high contrast. The image should reward inspection.

## Use Cases

- Flow charts for product workflows in discovery decks
- State machine diagrams for engineering specs
- Section openers in design documents
- Decision tree visuals for legal or trust posture artifacts
- Roadmap diagrams when phased over time

## Calibration Notes

The relic objects should feel slightly invented. Not stock symbols. A keeper
should not be a generic person icon. It should be a small relic that implies a
keeper: a candle, a lantern, a thread tied at one end. The viewer should
recognize the meaning without being able to name the symbol on first read.

Restraint is the discipline. One relic per node. One halo per composition. One
raking light. One ink color. The image earns its weight by what it leaves out.
