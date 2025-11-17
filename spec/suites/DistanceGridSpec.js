import { DistanceGrid } from 'leaflet.markercluster'

describe('distance grid', function () {
  it('addObject', function () {
    const grid = new DistanceGrid(100),
      obj = {}

    expect(grid.addObject(obj, { x: 0, y: 0 })).to.deep.equal(undefined)
    expect(grid.removeObject(obj, { x: 0, y: 0 })).to.deep.equal(true)
  })

  it('eachObject', function (done) {
    const grid = new DistanceGrid(100),
      obj = {}

    expect(grid.addObject(obj, { x: 0, y: 0 })).to.deep.equal(undefined)

    grid.eachObject(function (o) {
      expect(o).to.deep.equal(obj)
      done()
    })
  })

  it('getNearObject', function () {
    const grid = new DistanceGrid(100),
      obj = {}

    grid.addObject(obj, { x: 0, y: 0 })

    expect(grid.getNearObject({ x: 50, y: 50 })).to.equal(obj)
    expect(grid.getNearObject({ x: 100, y: 0 })).to.equal(obj)
  })

  it('getNearObject with cellSize 0', function () {
    const grid = new DistanceGrid(0),
      obj = {}

    grid.addObject(obj, { x: 0, y: 0 })

    expect(grid.getNearObject({ x: 50, y: 50 })).to.equal(null)
    expect(grid.getNearObject({ x: 0, y: 0 })).to.equal(obj)
  })
})
