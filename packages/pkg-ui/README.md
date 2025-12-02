pkg-ui

Scope
- shared React component system for all dashboards

Constraints
- deterministic theme tokens exported via TypeScript (no runtime theming)
- components built headless-first, wrapper styles applied in apps
- integrates with wagmi signer components for consistent wallet UX

Deliverables
- layout primitives (AppShell, Panel, MetricGrid)
- form atoms (Input, Select, HashViewer) with accessibility baked in
- notification primitives bridging svc-api-gateway websocket payloads to UI toasts/banners
