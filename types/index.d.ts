import * as L from "leaflet";

declare module "leaflet" {
  /**
   * Options for the MarkerClusterGroup.
   */
  interface MarkerClusterGroupOptions extends LayerOptions {
    /**
     * The maximum radius that a cluster will cover from the central marker (in pixels).
     * @default 80
     */
    maxClusterRadius?: number | ((zoom: number) => number);

    /**
     * Function used to create the cluster icon.
     * @default Uses built-in icon creation
     */
    iconCreateFunction?: (cluster: MarkerCluster) => Icon | DivIcon;

    /**
     * Map pane where the cluster icons will be added.
     * @default 'markerPane'
     */
    clusterPane?: string;

    /**
     * When true, spiderfies markers on every zoom level, not just max zoom.
     * @default false
     */
    spiderfyOnEveryZoom?: boolean;

    /**
     * When true, clicking a cluster at the bottom zoom level will spiderfy it.
     * @default true
     */
    spiderfyOnMaxZoom?: boolean;

    /**
     * When true, hovering over a cluster shows the bounds of its markers.
     * @default true
     */
    showCoverageOnHover?: boolean;

    /**
     * When true, clicking a cluster will zoom in to see its child markers.
     * @default true
     */
    zoomToBoundsOnClick?: boolean;

    /**
     * When true, a cluster will hold only one marker (shows the marker icon but behaves as a cluster).
     * @default false
     */
    singleMarkerMode?: boolean;

    /**
     * At this zoom level and below, markers will not be clustered.
     * @default null
     */
    disableClusteringAtZoom?: number | null;

    /**
     * Title for cluster markers. Can be a string or function.
     * Function signature: (cluster: MarkerCluster) => string
     * @default null
     */
    clusterMarkerTitle?: string | ((cluster: MarkerCluster) => string) | null;

    /**
     * When true, clusters and markers outside the viewpoint are removed for performance.
     * @default true
     */
    removeOutsideVisibleBounds?: boolean;

    /**
     * When true, enables zoom and spiderfy animations.
     * @default true
     */
    animate?: boolean;

    /**
     * When true, animates markers when adding after the group is added to the map.
     * @default false
     */
    animateAddingMarkers?: boolean;

    /**
     * Custom function to calculate spiderfy shape positions.
     * @default null
     */
    spiderfyShapePositions?: ((count: number, centerPt: Point) => Point[]) | null;

    /**
     * Multiplier for the distance spiderfied markers appear from the center.
     * @default 1
     */
    spiderfyDistanceMultiplier?: number;

    /**
     * Options for the spider leg polylines.
     * @default { weight: 1.5, color: '#222', opacity: 0.5 }
     */
    spiderLegPolylineOptions?: PolylineOptions;

    /**
     * When true, adds markers in chunks for better performance with large datasets.
     * @default true
     */
    chunkedLoading?: boolean;

    /**
     * Time interval (in ms) during which addLayers works before pausing.
     * @default 80
     */
    chunkInterval?: number;

    /**
     * Time (in ms) to wait between chunks.
     * @default 20
     */
    chunkDelay?: number;

    /**
     * Callback called with progress during chunked loading.
     * @default null
     */
    chunkProgress?: ((processed: number, total: number, elapsed: number) => void) | null;

    /**
     * Options to pass to the coverage Polygon constructor.
     * @default {}
     */
    polygonOptions?: PolylineOptions;
  }

  /**
   * Extends FeatureGroup by clustering the markers contained within.
   */
  class MarkerClusterGroup extends FeatureGroup {
    options: MarkerClusterGroupOptions;

    constructor(options?: MarkerClusterGroupOptions);

    /**
     * Adds a marker to the cluster group.
     */
    addLayer(layer: Layer): this;

    /**
     * Removes a marker from the cluster group.
     */
    removeLayer(layer: Layer): this;

    /**
     * Adds an array of markers to the cluster group.
     */
    addLayers(layers: Layer[], skipLayerAddEvent?: boolean): this;

    /**
     * Removes an array of markers from the cluster group.
     */
    removeLayers(layers: Layer[]): this;

    /**
     * Removes all markers from the cluster group.
     */
    clearLayers(): this;

    /**
     * Returns the bounds of all markers in the cluster group.
     */
    getBounds(): LatLngBounds;

    /**
     * Iterates over all markers in the cluster group.
     */
    eachLayer(fn: (layer: Layer) => void, context?: object): this;

    /**
     * Returns an array of all markers in the cluster group.
     */
    getLayers(): Layer[];

    /**
     * Returns a marker with the given internal ID.
     */
    getLayer(id: number): Layer | undefined;

    /**
     * Returns true if the given layer is in this cluster group.
     */
    hasLayer(layer: Layer): boolean;

    /**
     * Zooms to show the given layer, spiderfying if necessary.
     */
    zoomToShowLayer(layer: Layer, callback?: () => void): void;

    /**
     * Returns the visible parent cluster (or the layer itself if visible) for a marker.
     */
    getVisibleParent(marker: Marker): Marker | MarkerCluster | null;

    /**
     * Refreshes the icon of all clusters which are parents of the given marker(s).
     */
    refreshClusters(layers?: Layer | Layer[] | LayerGroup | MarkerCluster): this;

    /**
     * Unspiderfies any currently spiderfied cluster.
     */
    unspiderfy(): this;
  }

  /**
   * Creates a new MarkerClusterGroup.
   */
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

  /**
   * A cluster marker that contains child markers.
   */
  class MarkerCluster extends Marker {
    /**
     * Returns the count of child markers in the cluster.
     */
    getChildCount(): number;

    /**
     * Returns all child markers of this cluster.
     */
    getAllChildMarkers(storageArray?: Marker[], ignoreDraggedMarker?: boolean): Marker[];

    /**
     * Returns the bounds of all child markers.
     */
    getBounds(): LatLngBounds;

    /**
     * Zooms the map to show all markers in this cluster.
     */
    zoomToBounds(fitBoundsOptions?: FitBoundsOptions): void;

    /**
     * Spiderfies this cluster to show all contained markers.
     */
    spiderfy(): void;

    /**
     * Unspiderfies this cluster.
     */
    unspiderfy(zoomDetails?: object): void;
  }

  /**
   * Extends Marker with refreshIconOptions method when used with MarkerClusterGroup.
   */
  interface Marker {
    /**
     * Updates the icon options and refreshes the marker.
     * Used when the marker is in a MarkerClusterGroup with singleMarkerMode.
     */
    refreshIconOptions?(options?: IconOptions, directlyRefreshClusters?: boolean): this;
  }

  /**
   * Events fired by MarkerClusterGroup.
   */
  interface LeafletEventHandlerFnMap {
    /**
     * Fired when a cluster is clicked.
     */
    clusterclick?: LeafletEventHandlerFn;

    /**
     * Fired when the mouse enters a cluster.
     */
    clustermouseover?: LeafletEventHandlerFn;

    /**
     * Fired when the mouse leaves a cluster.
     */
    clustermouseout?: LeafletEventHandlerFn;

    /**
     * Fired when a cluster is spiderfied.
     */
    spiderfied?: LeafletEventHandlerFn;

    /**
     * Fired when a cluster is unspiderfied.
     */
    unspiderfied?: LeafletEventHandlerFn;

    /**
     * Fired when the cluster animation ends.
     */
    animationend?: LeafletEventHandlerFn;

    /**
     * Fired when multiple layers are added at once.
     */
    layersadd?: LeafletEventHandlerFn;
  }
}

export = L;
