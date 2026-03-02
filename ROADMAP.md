# Future Work

## v4+

### Rename package to `leaflet-marker-cluster`

Kebab-case is the npm convention. Cleaner import:

```js
import { MarkerClusterGroup } from "leaflet-marker-cluster";
```

Clearly distinct from the original `leaflet.markercluster`. Breaking change → major version (v4).

---

### Performance optimizations

See [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md) for a detailed breakdown of where time is spent.

Candidates for large datasets (>100k markers):

- Reduce zoom levels processed per marker (currently 3–5 levels per `addLayer` call)
- Adaptive clustering strategies (skip intermediate zoom levels for very dense areas)
- Web Worker for DistanceGrid computation (pure CPU work, no DOM dependency)
