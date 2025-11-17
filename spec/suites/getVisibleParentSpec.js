import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerCluster, MarkerClusterGroup } from 'leaflet.markercluster'

describe('getVisibleParent', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let group, map, div

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
    group.clearLayers()
    map.removeLayer(group)
    map.remove()
    document.body.removeChild(div)

    group = map = div = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('gets the marker if the marker is visible', function () {
    group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])

    group.addLayer(marker)
    map.addLayer(group)

    const vp = group.getVisibleParent(marker)

    expect(vp).to.equal(marker)
  })

  it('gets the visible cluster if it is clustered', function () {
    group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    const vp = group.getVisibleParent(marker)

    expect(vp).to.be.an.instanceof(MarkerCluster)
    expect(vp._icon).to.not.be.null
    expect(vp._icon).to.not.be.undefined
  })

  it('returns null if the marker and parents are all not visible', function () {
    group = new MarkerClusterGroup()
    const marker = new Marker([5.5, 1.5])
    const marker2 = new Marker([5.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    const vp = group.getVisibleParent(marker)

    expect(vp).to.be.null
  })
})
