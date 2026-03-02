import { describe, it } from 'node:test'
import assert from 'node:assert'

import { QuickHull } from '../../dist/leaflet.markercluster.js'

describe('quickhull', function () {
  describe('getDistant', function () {
    it('zero distance', function () {
      const bl = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ]
      assert.deepStrictEqual(QuickHull.getDistant({ lat: 0, lng: 0 }, bl), 0)
    })
    it('non-zero distance', function () {
      const bl = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ]
      assert.deepStrictEqual(QuickHull.getDistant({ lat: 5, lng: 5 }, bl), -50)
    })
  })

  describe('getConvexHull', function () {
    it('creates a hull', function () {
      assert.deepStrictEqual(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 10, lng: 0 },
        { lat: 10, lng: 10 },
        { lat: 0, lng: 10 },
        { lat: 5, lng: 5 },
      ]), [
        { lat: 0, lng: 10 },
        { lat: 10, lng: 10 },
        { lat: 10, lng: 0 },
        { lat: 0, lng: 0 },
      ])
    })
    it('creates a hull for vertically-aligned objects', function () {
      assert.deepStrictEqual(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 5, lng: 0 },
        { lat: 10, lng: 0 },
      ]), [
        { lat: 0, lng: 0 },
        { lat: 10, lng: 0 },
      ])
    })
    it('creates a hull for horizontally-aligned objects', function () {
      assert.deepStrictEqual(QuickHull.getConvexHull([{ lat: 0, lng: 0 },
        { lat: 0, lng: 5 },
        { lat: 0, lng: 10 },
      ]), [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
      ])
    })
  })
})
