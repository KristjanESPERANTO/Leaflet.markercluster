import { QuickHull } from 'leaflet.markercluster'

describe('quickhull', function () {
  describe('getDistant', function () {
    it('zero distance', function () {
      const bl = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ]
      expect(QuickHull.getDistant({ lat: 0, lng: 0 }, bl)).to.deep.equal(0)
    })
    it('non-zero distance', function () {
      const bl = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ]
      expect(QuickHull.getDistant({ lat: 5, lng: 5 }, bl)).to.deep.equal(-50)
    })
  })

  describe('getConvexHull', function () {
    it('creates a hull', function () {
      expect(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 10, lng: 0 },
        { lat: 10, lng: 10 },
        { lat: 0, lng: 10 },
        { lat: 5, lng: 5 },
      ])).to.deep.equal([
        { lat: 0, lng: 10 },
        { lat: 10, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 0, lng: 0 },
      ])
    })
    it('creates a hull for vertically-aligned objects', function () {
      expect(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 5, lng: 0 },
        { lat: 10, lng: 0 },
      ])).to.deep.equal([
        { lat: 0, lng: 0 },
        { lat: 10, lng: 0 },
      ])
    })
    it('creates a hull for horizontally-aligned objects', function () {
      expect(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 0, lng: 5 },
        { lat: 0, lng: 10 },
      ])).to.deep.equal([
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ])
    })
  })
})
