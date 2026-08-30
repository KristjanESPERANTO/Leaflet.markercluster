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

See [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md) for measured results, trade-offs, and next steps.
