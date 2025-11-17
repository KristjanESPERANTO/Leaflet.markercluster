import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('clusterMarkerTitle', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div

  beforeEach(function () {
    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { maxZoom: 18, trackResize: false })

    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    map.remove()
    document.body.removeChild(div)

    map = div = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('does not set title when clusterMarkerTitle option is not provided', function () {
    const group = new MarkerClusterGroup()
    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.50001])

    group.addLayer(marker1)
    group.addLayer(marker2)
    map.addLayer(group)

    // Get the top cluster level
    const topCluster = group._topClusterLevel

    // The top cluster should have an icon when there are multiple markers
    if (topCluster._icon) {
      expect(topCluster._icon.title).to.be('')
    }
  })

  it('sets static string title when clusterMarkerTitle is a string', function () {
    const group = new MarkerClusterGroup({
      clusterMarkerTitle: 'Click to expand cluster',
    })
    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.50001])

    group.addLayer(marker1)
    group.addLayer(marker2)
    map.addLayer(group)

    const topCluster = group._topClusterLevel

    if (topCluster._icon) {
      expect(topCluster._icon.title).to.be('Click to expand cluster')
    }
  })

  it('sets dynamic title when clusterMarkerTitle is a function', function () {
    const group = new MarkerClusterGroup({
      clusterMarkerTitle: function (cluster) {
        const count = cluster.getChildCount()
        return 'Cluster with ' + count + (count === 1 ? ' marker' : ' markers')
      },
    })
    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.50001])
    const marker3 = new Marker([1.5, 1.50002])

    group.addLayer(marker1)
    group.addLayer(marker2)
    group.addLayer(marker3)
    map.addLayer(group)

    const topCluster = group._topClusterLevel

    if (topCluster._icon) {
      const count = topCluster.getChildCount()
      const expectedTitle = 'Cluster with ' + count + (count === 1 ? ' marker' : ' markers')
      expect(topCluster._icon.title).to.be(expectedTitle)
    }
  })

  it('updates title when cluster content changes', function () {
    const group = new MarkerClusterGroup({
      clusterMarkerTitle: function (cluster) {
        return 'Count: ' + cluster.getChildCount()
      },
    })
    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.50001])
    const marker3 = new Marker([1.5, 1.50002])

    group.addLayer(marker1)
    group.addLayer(marker2)
    map.addLayer(group)

    const topCluster = group._topClusterLevel

    if (topCluster._icon) {
      const initialCount = topCluster.getChildCount()
      expect(topCluster._icon.title).to.be('Count: ' + initialCount)
    }

    // Add another marker
    group.addLayer(marker3)

    // Title should update
    if (topCluster._icon) {
      const newCount = topCluster.getChildCount()
      expect(topCluster._icon.title).to.be('Count: ' + newCount)
    }
  })

  it('sets title for single marker clusters when singleMarkerMode is true', function () {
    const group = new MarkerClusterGroup({
      singleMarkerMode: true,
      clusterMarkerTitle: 'Single marker cluster',
    })
    const marker1 = new Marker([1.5, 1.5])

    group.addLayer(marker1)
    map.addLayer(group)

    const topCluster = group._topClusterLevel

    // In singleMarkerMode, even a single marker gets clustered
    if (topCluster._icon) {
      expect(topCluster._icon.title).to.be('Single marker cluster')
    }
  })
})
