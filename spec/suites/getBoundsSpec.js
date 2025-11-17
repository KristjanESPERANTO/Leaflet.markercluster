import { LatLngBounds, Map, Marker, Polygon } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('getBounds', function () {
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
  describe('polygon layer', function () {
    it('returns the correct bounds before adding to the map', function () {
      const group = new MarkerClusterGroup()
      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      group.addLayer(polygon)

      expect(group.getBounds().equals(polygon.getBounds())).to.be.true
    })

    it('returns the correct bounds after adding to the map after adding polygon', function () {
      const group = new MarkerClusterGroup()
      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      group.addLayer(polygon)
      map.addLayer(group)

      expect(group.getBounds().equals(polygon.getBounds())).to.be.true
    })

    it('returns the correct bounds after adding to the map before adding polygon', function () {
      const group = new MarkerClusterGroup()
      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      map.addLayer(group)
      group.addLayer(polygon)

      expect(group.getBounds().equals(polygon.getBounds())).to.be.true
    })
  })

  describe('marker layers', function () {
    it('returns the correct bounds before adding to the map', function () {
      const group = new MarkerClusterGroup()
      const marker = new Marker([1.5, 1.5])
      const marker2 = new Marker([1.0, 5.0])
      const marker3 = new Marker([6.0, 2.0])

      group.addLayers([marker, marker2, marker3])

      expect(group.getBounds().equals(new LatLngBounds([1.0, 5.0], [6.0, 1.5]))).to.be.true
    })

    it('returns the correct bounds after adding to the map after adding markers', function () {
      const group = new MarkerClusterGroup()
      const marker = new Marker([1.5, 1.5])
      const marker2 = new Marker([1.0, 5.0])
      const marker3 = new Marker([6.0, 2.0])

      group.addLayers([marker, marker2, marker3])
      map.addLayer(group)

      expect(group.getBounds().equals(new LatLngBounds([1.0, 5.0], [6.0, 1.5]))).to.be.true
    })

    it('returns the correct bounds after adding to the map before adding markers', function () {
      const group = new MarkerClusterGroup()
      const marker = new Marker([1.5, 1.5])
      const marker2 = new Marker([1.0, 5.0])
      const marker3 = new Marker([6.0, 2.0])

      map.addLayer(group)
      group.addLayers([marker, marker2, marker3])

      expect(group.getBounds().equals(new LatLngBounds([1.0, 5.0], [6.0, 1.5]))).to.be.true
    })
  })

  describe('marker and polygon layers', function () {
    it('returns the correct bounds before adding to the map', function () {
      const group = new MarkerClusterGroup()
      const marker = new Marker([6.0, 3.0])
      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      group.addLayers([marker, polygon])

      expect(group.getBounds().equals(new LatLngBounds([1.5, 1.5], [6.0, 3.0]))).to.be.true
    })

    it('returns the correct bounds after adding to the map', function () {
      const group = new MarkerClusterGroup()
      const marker = new Marker([6.0, 3.0])
      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      map.addLayer(group)
      group.addLayers([marker, polygon])

      expect(group.getBounds().equals(new LatLngBounds([1.5, 1.5], [6.0, 3.0]))).to.be.true
    })
  })

  describe('blank layer', function () {
    it('returns a blank bounds', function () {
      const group = new MarkerClusterGroup()

      expect(group.getBounds().isValid()).to.be.false
    })
  })
})
