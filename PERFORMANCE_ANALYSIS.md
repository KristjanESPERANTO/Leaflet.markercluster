# Performance Analysis: Leaflet.markercluster

**Test Dataset:** 100,000 markers at zoom level 2
**Benchmark:** 5 runs per page load, current build, no throttling
**Normal clustering time:** 187.7 ms median (~533,000 markers/second)

## Performance Bottlenecks

The clustering algorithm is measured with the browser benchmark rather than with a single hand-attributed CPU profile. For each marker added to the map, the algorithm iterates through multiple zoom levels and performs grid lookups to find nearby clusters or markers. In the current run this produced 168,901 calls to `getNearObject()` and 49,864 calls to `addObject()` across the repeated dataset.

The detailed timings below come from the diagnostic mode (`?profile=1`), which wraps selected operations with `performance.now()`. They are useful for attribution, but the diagnostic run is slower than the normal benchmark. The residual is therefore not a proven optimization target and must not be interpreted as engine overhead.

| Category                        | Calls   | Diagnostic time (ms) | Diagnostic share | Description                                              |
| ------------------------------- | ------- | -------------------- | ---------------- | -------------------------------------------------------- |
| **DistanceGrid getNearObject**  | 168,901 | 68.7                 | 21.3%            | 3×3 grid lookup and nearest-candidate search             |
| **Leaflet map.project()**       | 193,834 | 37.3                 | 11.5%            | Converting lat/lng to pixel coordinates                  |
| **Cluster hierarchy**           | 143,969 | 32.4                 | 10.0%            | Adding markers and clusters to parent clusters           |
| **DistanceGrid addObject**      | 49,864  | 15.7                 | 4.9%             | Coordinate hashing and cell insertion                    |
| **Unattributed residual**       | -       | 168.8                | 52.3%            | Loop control, array access, GC, and measurement overhead |
| **Diagnostic clustering total** | -       | 322.9                | 100%             | Five-run average with profiling enabled                  |

**Key Insight:** The grid-based approach is a good fit for this workload and outperforms tree-based alternatives (R-tree is 75% slower). However, "already highly optimized" overstates the current state: the hot paths still contain avoidable per-call overhead that can be removed **without any algorithmic change**. Algorithmic changes (fewer zoom levels, adaptive clustering) are a second, larger lever on top of that.

## Benchmark interpretation

The browser benchmark was run at `http://127.0.0.1:8000/benchmark/marker-clustering.html` with 100,000 markers, five runs per page load, no CPU or network throttling, and the final run left visible on the map. The current page load produced clustering times of 185.1 ms, 187.7 ms, 188.1 ms, 200.6 ms, and 183.7 ms. The median was 187.7 ms.

The diagnostic run (`?profile=1`) separates the selected operations but adds timing overhead. Its residual must therefore remain an accounting remainder, not a claim about JavaScript engine cost. The measurements identify where to investigate next; they do not by themselves justify another micro-optimization.

The diagnostic profile also measures cumulative time by zoom level. In the current run, zoom 18 accounted for 54.0 ms in `getNearObject()` and 9.8 ms in `addObject()`, while zoom 17 accounted for 9.5 ms and 4.2 ms respectively. These values include measurement overhead and are useful for locating work, not for absolute speed comparisons.

As a controlled experiment, the benchmark was run with `?maxClusterZoom=17`, which disables clustering at zoom 18 while leaving the map zoom at 18. The latest five-run measurement produced a clustering median of 136.8 ms. The default configuration has produced medians between 187.2 ms and 198.2 ms in comparable five-run reload series, so the observed reduction is approximately 27-31%. The profiling run showed that zoom 18 work was removed, as expected. This is a workload result, not a proposed default: disabling clustering at a zoom level changes the cluster hierarchy and must be evaluated for its user-visible behavior before considering it as an option or product change. The public API equivalent is `disableClusteringAtZoom: 18` when the map maximum zoom is 18; `maxClusterZoom` is only a benchmark parameter.

## Algorithmic potential without behavior changes

The largest theoretical lever is reducing the number of zoom-level searches. In the current algorithm, each marker is processed from the maximum clustering zoom downwards until it joins an existing cluster or is stored in the unclustered grid. Skipping levels or stopping earlier would reduce the work, but it would also change the cluster hierarchy and therefore the visible behavior. The `maxClusterZoom` experiment demonstrates this trade-off; it is not a library-wide optimization recommendation.

With identical clustering behavior, only constant-factor improvements remain. The most plausible untested candidate is replacing the nested `Map<y, Map<x, cell>>` with a numeric single-key map. Unlike the rejected string-key variant, this could remove one map lookup without allocating a string, but it must handle negative coordinates and remain within JavaScript's safe integer range. The potential gain is likely small and must be measured against the current nested map.

Other algorithmic changes, such as adaptive zoom traversal, marker pre-sorting, or combining the cluster and unclustered grids, either change the order-dependent cluster hierarchy or require different nearest-object semantics. They should therefore be treated as behavior changes, not as UX-neutral optimizations.

The first Leaflet-side candidate was tested and kept in `MarkerClusterGroup._addLayer()`: existing `LatLng` instances are passed directly to `map.options.crs.latLngToPoint()` instead of through `Map.project()`, which creates another `LatLng` wrapper. Against fresh baseline runs of 190.5 ms and 192.8 ms, six direct-CRS runs measured 184.9 ms, 184.4 ms, 181.8 ms, 186.0 ms, 183.0 ms, and 181.0 ms. This is a small constant-factor improvement of roughly 3-5% on this benchmark. The direct CRS call assumes that custom map subclasses do not override `Map.project()` with different behavior.

A projection cache was tested next. It reused the zoom-independent CRS projection and applied the zoom transformation for each level, with a fallback for custom CRS implementations. This was slower than the direct CRS path: two cache runs measured 215.7 ms and 212.6 ms, compared with approximately 183.7 ms across the direct-CRS runs. The cache was removed because its `WeakMap` lookup and additional transformation work outweighed the saved projection calculations.

The numeric single-key grid was also tested. It encoded signed cell coordinates as a safe numeric pair and retained a fallback for unusual coordinates. The focused tests passed, but two benchmark runs measured 208.3 ms and 207.0 ms, compared with approximately 183.7 ms for the nested grid with direct CRS projection. The extra encoding and fallback logic outweighed the saved nested lookup, so the nested grid remains in use.

## Conclusion and Next Steps

The `disableClusteringAtZoom` experiment is not suitable for Veggiekarte. Showing
more individual markers at the highest zoom levels makes the existing exact-coordinate
overlaps more visible and does not provide an acceptable interaction improvement.
The default clustering behavior should therefore remain unchanged.

No further library-wide optimization is currently justified by this benchmark. New
work should begin only with a concrete, behavior-preserving hypothesis and should be
validated against the existing tests and the 100,000-marker benchmark. Changes that
reduce zoom traversal remain possible, but they alter the cluster hierarchy and would
need to be evaluated as deliberate behavior changes rather than performance-only fixes.

## Rejected experiments retained for future reference

These experiments were measured and rejected. They remain documented only to avoid repeating work.

### Derive projected points across zoom levels instead of re-projecting

In `_addLayer()` (`src/MarkerClusterGroup.js`), every marker calls `this._map.project(layer.getLatLng(), zoom)` once per zoom level while iterating downwards. Because Leaflet's CRS transformation is affine and zoom is a scale factor, deriving lower zoom points by halving was mathematically exact in the tested CRS and coordinate samples. However, the headless benchmark measured 82.0 ms median versus 81.4 ms for the current implementation, so the added point scaling and allocation did not produce a reliable gain. The experiment was discarded.

### Simplify the comparison in `getNearObject()`

```js
if (dist < closestDistSq || (dist <= closestDistSq && closest === null))
```

The second clause only handles the first-object edge case where `dist === sqCellSize`. Replacing `<=` with `===` preserves the behavior, but the browser benchmark measured 282 ms median versus 263 ms for the current implementation. The change was therefore rejected; the extra comparison simplification does not produce a reliable gain on this workload.

### Single-key grid

The proposed single-key grid was implemented and benchmarked, replacing the nested `Map<y, Map<x, cell>>` with one Map keyed by a combined string. It passed the functional tests, but measured 82.1 ms median versus 81.4 ms for the current implementation. String-key creation therefore costs at least as much as the second Map lookup for this workload, so the experiment was discarded.

The current nested grid remains the better implementation. A future structural optimization should avoid per-lookup key construction, for example with a carefully bounded numeric key or a different storage strategy, and must be validated against the same benchmark before adoption.

A cell-level distance-pruning experiment was also tested. It skipped cells whose geometric minimum distance could not improve the current match, but measured only 81.1 ms median versus 81.4 ms for the current implementation, with runs between 80.5 ms and 85.8 ms. This difference is within the observed noise and does not justify the added arithmetic and branching, so the experiment was discarded as well.

Any future optimization should be validated against the existing tests and the current 100,000-marker benchmark.
