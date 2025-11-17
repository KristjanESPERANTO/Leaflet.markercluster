import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('non-integer min/max zoom', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div, clock

  beforeEach(function () {
    clock = sinon.useFakeTimers()

    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { minZoom: 0.5, maxZoom: 18.5, trackResize: false })

    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    map.remove()
    document.body.removeChild(div)
    clock.restore()
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('dont break adding and removing markers', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    group.addLayer(marker3)

    expect(marker._icon).to.be.undefined
    expect(marker2._icon).to.be.undefined
    expect(marker3._icon).to.be.undefined

    expect(map._panes.markerPane.childNodes.length).to.equal(1)

    group.removeLayer(marker2)
  })
})
