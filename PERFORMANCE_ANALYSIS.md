# Performance Analysis: Leaflet.markercluster

**Test Dataset:** 89,269 markers at zoom level 2  
**Total Time:** ~5,700ms (~14,000 markers/second)

## Performance Bottlenecks

The clustering algorithm's performance is dominated by **spatial indexing operations** in the DistanceGrid data structure, which accounts for nearly half of the total execution time. For each marker added to the map, the algorithm iterates through multiple zoom levels (typically 3-5 levels), performing grid lookups to find nearby clusters or markers. This results in approximately 400,000 calls to `getNearObject()`, which searches a 3×3 grid of cells and calculates distances to all objects within those cells. The second major bottleneck is grid maintenance (`addObject()` and `removeObject()`), which involves coordinate hashing, cell management, and array operations. Together, these spatial operations consume about 50% of clustering time, while DOM rendering is negligible (<1%). The "Other" category represents unavoidable JavaScript engine overhead including function calls, garbage collection, and JIT compilation.

| Category                       | Time (ms) | Percentage | Description                                              |
| ------------------------------ | --------- | ---------- | -------------------------------------------------------- |
| **DistanceGrid getNearObject** | 1,691     | 29.6%      | Finding nearest neighbor in 3×3 grid cells (~400k calls) |
| **Grid addObject**             | 866       | 15.2%      | Adding objects to grid cells with coordinate hashing     |
| **Cluster Hierarchy**          | 445       | 7.8%       | Building parent-child relationships between clusters     |
| **Leaflet map.project()**      | 277       | 4.9%       | Converting lat/lng to pixel coordinates                  |
| **Grid removeObject**          | 262       | 4.6%       | Removing objects from grid cells                         |
| **Event Binding**              | 168       | 2.9%       | Attaching event handlers to markers                      |
| **Other Operations**           | 788       | 13.8%      | JS engine overhead, GC, function calls                   |
| **DOM Rendering**              | 13        | 0.2%       | Actually displaying the 29 visible clusters              |
| **Various Small Ops**          | 1,204     | 21.0%      | Array access, conditionals, loops, etc.                  |

**Key Insight:** Spatial indexing (DistanceGrid) is already highly optimized. The current grid-based implementation outperforms tree-based alternatives (R-tree is 75% slower). Further performance gains would require algorithmic changes like reducing zoom levels processed or using adaptive clustering strategies.
