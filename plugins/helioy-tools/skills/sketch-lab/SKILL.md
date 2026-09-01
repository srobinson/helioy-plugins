---
name: sketch-lab
description: >-
  Generate Sketch Lab architecture diagrams and open them with a share URL.
  Use when the user asks for a Sketch Lab diagram, sketchlab.app board, 3D floor
  stack, architecture sketch in Sketch Lab, or GeneratedGraph JSON. Use only
  for Sketch Lab. Route Mermaid, Excalidraw, and Mission Control diagrams to
  their own tools.
---

# Sketch Lab diagrams

Create a `GeneratedGraph` JSON object, encode it in a share URL, and open it in Sketch Lab.

Use `https://sketchlab.webdevcody.com` as the production origin. Use another origin when the user supplies one, such as `http://localhost:5173`.

## Workflow

1. Draft a `GeneratedGraph` that follows the schema and rules below.
2. Validate node IDs, edge references, icon keys, layer indexes, and hard limits.
3. Serialize the graph as compact JSON and URI encode the complete JSON string.
4. Open `{ORIGIN}/?g={URI_ENCODED_JSON}` with the available browser tool or operating system command.
5. Return the URL when no browser can open it.
6. Confirm the board name and node count. Include the full JSON only when the user asks for it.

Prefer 4 to 14 nodes. Never exceed 48 nodes, 96 edges, or 48 floors.

Do not wrap JSON used in the URL in Markdown fences. Do not emit Mermaid or ASCII art for a Sketch Lab request.

## URL example

This macOS shell example works without `lz-string`:

```bash
SKETCHLAB_ORIGIN="${SKETCHLAB_ORIGIN:-https://sketchlab.webdevcody.com}"
GRAPH_JSON='{"name":"Demo","layers":[],"nodes":[{"id":"api","label":"API","kind":"icon","icon":"microservice","color":"#0f2740","layer":0}],"edges":[]}'
open "${SKETCHLAB_ORIGIN}/?g=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$GRAPH_JSON")"
```

Use `xdg-open` on Linux.

## Schema

```json
{
  "name": "string (optional)",
  "layers": [
    { "name": "string", "color": "#RRGGBB" }
  ],
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "kind": "rect | circle | icon | text",
      "icon": "string (icon key when kind is icon)",
      "color": "#RRGGBB",
      "layer": 0
    }
  ],
  "edges": [
    {
      "from": "node id",
      "to": "node id",
      "label": "string",
      "directed": true
    }
  ]
}
```

## Graph rules

- Include at least one node. Give every node a unique `id`.
- Reference existing node IDs from each edge. Reject self loops.
- Use `kind: "icon"` for services, databases, queues, clouds, users, clients, and infrastructure.
- Reserve `kind: "text"` for annotations. Use `rect` and `circle` sparingly.
- Prefer dark canvas fills such as `#0f2740`.
- Use bright floor accents such as `#38bdf8`, `#4ade80`, `#fbbf24`, `#fb923c`, `#f472b6`, and `#c084fc`.
- Prefer directed edges for request, data, and dependency flows.
- Order `layers` from bottom to top. Set each node's `layer` to its zero based floor index.
- Use two to five floors when the system has natural tiers, such as Data, App, Edge, and Client.
- For a flat diagram, use `"layers": []` and set every node's `layer` to `0`.
- Use only the icon keys below. Sketch Lab replaces unknown icons with `microservice`.
- Let Sketch Lab choose the layout. Do not add `x` or `y` positions.

## Icon keys

```text
server, container, kubernetes, vm, function, microservice, cpu, memory,
router, switch, firewall, load-balancer, gateway, proxy, dns, cdn, wifi,
network, vpn, globe, database, cache, table, bucket, disk, archive, file,
folder, queue, event-bus, stream, webhook, bell, alert, chat, mail, feed,
browser, desktop, laptop, phone, tablet, gauge, chart, logs, dashboard,
git, repo, pipeline, package, terminal, code, gear, rocket, bug, bot,
neural, search, lock, key, shield, vault, certificate, fingerprint, user,
users, id-badge, cloud, datacenter, location, calendar, clock, sync,
upload, download, link, tag, flag, toggle, filter, workflow, decision,
bolt, check, star, heart
```

## Flat request example

```json
{
  "name": "Checkout API",
  "layers": [],
  "nodes": [
    { "id": "web", "label": "Web", "kind": "icon", "icon": "browser", "color": "#0f2740", "layer": 0 },
    { "id": "api", "label": "API", "kind": "icon", "icon": "microservice", "color": "#0f2740", "layer": 0 },
    { "id": "db", "label": "Postgres", "kind": "icon", "icon": "database", "color": "#0f2740", "layer": 0 }
  ],
  "edges": [
    { "from": "web", "to": "api", "label": "HTTPS", "directed": true },
    { "from": "api", "to": "db", "label": "SQL", "directed": true }
  ]
}
```

## Floor stack example

```json
{
  "name": "SaaS stack",
  "layers": [
    { "name": "Data", "color": "#38bdf8" },
    { "name": "App", "color": "#4ade80" },
    { "name": "Edge", "color": "#fbbf24" }
  ],
  "nodes": [
    { "id": "db", "label": "DB", "kind": "icon", "icon": "database", "color": "#0f2740", "layer": 0 },
    { "id": "api", "label": "API", "kind": "icon", "icon": "microservice", "color": "#0f2740", "layer": 1 },
    { "id": "cdn", "label": "CDN", "kind": "icon", "icon": "cdn", "color": "#0f2740", "layer": 2 }
  ],
  "edges": [
    { "from": "cdn", "to": "api", "label": "", "directed": true },
    { "from": "api", "to": "db", "label": "", "directed": true }
  ]
}
```
