# scenes/

React-three-fiber scenes. **All client-only** (`'use client'`, loaded via
`dynamic(import, { ssr: false })`). Cap `dpr={[1, 1.5]}`, show a poster before
WebGL hydrates, lazy-load, and downgrade to a flat hero on weak Android devices.

_Scaffold — populated in a later phase._
