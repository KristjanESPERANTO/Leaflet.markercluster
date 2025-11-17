import { Circle, CircleMarker, LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('unspiderfy', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let div, map, group, clock

  beforeEach(function () {
    clock = sinon.useFakeTimers()

    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { maxZoom: 18, trackResize: false })

    // Corresponds to zoom level 8 for the above div dimensions.
    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    if (group instanceof MarkerClusterGroup) {
      group.removeLayers(group.getLayers())
      map.removeLayer(group)
    }
    map.remove()
    div.remove()

    clock.restore()

    div = map = group = clock = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('Unspiderfies 2 Markers', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    marker.__parent.spiderfy()

    clock.tick(1000)

    group.unspiderfy()

    clock.tick(1000)

    expect(map.hasLayer(marker)).to.be(false)
    expect(map.hasLayer(marker2)).to.be(false)
  })

  it('Unspiderfies 2 CircleMarkers', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])
    const marker2 = new CircleMarker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    marker.__parent.spiderfy()

    clock.tick(1000)

    group.unspiderfy()

    clock.tick(1000)

    expect(map.hasLayer(marker)).to.be(false)
    expect(map.hasLayer(marker2)).to.be(false)
  })

  it('Unspiderfies 2 Circles', function () {
    group = new MarkerClusterGroup()

    const marker = new Circle([1.5, 1.5], 10)
    const marker2 = new Circle([1.5, 1.5], 10)

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    marker.__parent.spiderfy()

    clock.tick(1000)

    group.unspiderfy()

    clock.tick(1000)

    expect(map.hasLayer(marker)).to.be(false)
    expect(map.hasLayer(marker2)).to.be(false)
  })

  it('fires unspiderfied event on unspiderfy', function (done) {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    marker.__parent.spiderfy()

    clock.tick(1000)

    // Add event listener
    group.on('unspiderfied', function (event) {
      expect(event.target).to.be(group)
      expect(event.cluster).to.be.a(Marker)
      expect(event.markers[1]).to.be(marker)
      expect(event.markers[0]).to.be(marker2)

      done()
    })

    group.unspiderfy()

    clock.tick(1000)
  })
})
