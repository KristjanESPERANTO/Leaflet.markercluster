import { describe, it } from 'node:test'
import assert from 'node:assert'

import { DistanceGrid } from '../../dist/leaflet.markercluster.js'

describe('distance grid', function () {
  it('addObject', function () {
    const grid = new DistanceGrid(100),
      obj = {}

    assert.deepStrictEqual(grid.addObject(obj, { x: 0, y: 0 }), undefined)
    assert.deepStrictEqual(grid.removeObject(obj, { x: 0, y: 0 }), true)
  })

  it('eachObject', function (t, done) {
    const grid = new DistanceGrid(100),
      obj = {}

    assert.deepStrictEqual(grid.addObject(obj, { x: 0, y: 0 }), undefined)

    grid.eachObject(function (o) {
      assert.deepStrictEqual(o, obj)
      done()
    })
  })

  it('getNearObject', function () {
    const grid = new DistanceGrid(100),
      obj = {}

    grid.addObject(obj, { x: 0, y: 0 })

    assert.strictEqual(grid.getNearObject({ x: 50, y: 50 }), obj)
    assert.strictEqual(grid.getNearObject({ x: 100, y: 0 }), obj)
  })

  it('getNearObject with cellSize 0', function () {
    const grid = new DistanceGrid(0),
      obj = {}

    grid.addObject(obj, { x: 0, y: 0 })

    assert.strictEqual(grid.getNearObject({ x: 50, y: 50 }), null)
    assert.strictEqual(grid.getNearObject({ x: 0, y: 0 }), obj)
  })
})
