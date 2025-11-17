import Leaflet from 'leaflet'

describe('L#noConflict', function () {
  it('restores the previous L value and returns Leaflet namespace', function () {
    expect(Leaflet.version).to.be.ok()
  })
})
