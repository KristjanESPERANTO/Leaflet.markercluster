import L from 'leaflet'

describe('moving markers', function () {
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

    map = new L.Map(div, { maxZoom: 18, trackResize: false })

    // Corresponds to zoom level 8 for the above div dimensions.
    map.fitBounds(new L.LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    if (group instanceof L.MarkerClusterGroup) {
      group.clearLayers()
      map.removeLayer(group)
    }

    map.remove()
    div.remove()
    clock.restore()

    div = map = group = clock
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('moves a marker that was moved while off the map', function () {
    group = new L.MarkerClusterGroup()

    const marker = new L.Marker([10, 10])
    map.addLayer(group)
    group.addLayer(marker)

    map.removeLayer(group)
    marker.setLatLng([1.5, 1.5])
    map.addLayer(group)

    expect(group.getLayers().length).to.be(1)
  })

  it('moves multiple markers that were moved while off the map', function () {
    group = new L.MarkerClusterGroup()
    map.addLayer(group)

    const markers = []
    for (let i = 0; i < 10; i++) {
      let marker = new L.Marker([10, 10])
      group.addLayer(marker)
      markers.push(marker)
    }

    map.removeLayer(group)
    for (let i = 0; i < 10; i++) {
      let marker = markers[i]
      marker.setLatLng([1.5, 1.5])
    }
    map.addLayer(group)

    expect(group.getLayers().length).to.be(10)
  })
})
