import { Icon, LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('singleMarkerMode option', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let div, map, group, defaultIcon, clusterIcon, marker

  beforeEach(function () {
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

    defaultIcon = new Icon.Default()
    clusterIcon = new Icon.Default()
    marker = new Marker([1.5, 1.5])
    marker.setIcon(defaultIcon)
  })

  afterEach(function () {
    if (group instanceof MarkerClusterGroup) {
      group.removeLayers(group.getLayers())
      map.removeLayer(group)
    }

    map.remove()
    div.remove()

    div = map = group = defaultIcon = clusterIcon = marker = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('overrides marker icons when set to true', function () {
    group = new MarkerClusterGroup({
      singleMarkerMode: true,
      iconCreateFunction: function () {
        return clusterIcon
      },
    }).addTo(map)

    expect(marker.options.icon).to.equal(defaultIcon)

    marker.addTo(group)

    expect(marker.options.icon).to.equal(clusterIcon)
  })

  it('does not modify marker icons by default (or set to false)', function () {
    group = new MarkerClusterGroup({
      iconCreateFunction: function () {
        return clusterIcon
      },
    }).addTo(map)

    expect(marker.options.icon).to.equal(defaultIcon)

    marker.addTo(group)

    expect(marker.options.icon).to.equal(defaultIcon)
  })
})
