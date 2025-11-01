import Leaflet, { Util } from 'leaflet'

export const DistanceGrid = Leaflet.DistanceGrid = function (cellSize) {
  this._cellSize = cellSize
  this._sqCellSize = cellSize * cellSize
  this._grid = {}
  this._objectPoint = { }
}

DistanceGrid.prototype = {

  addObject: function (obj, point) {
    const x = this._getCoord(point.x),
      y = this._getCoord(point.y),
      grid = this._grid,
      row = grid[y] = grid[y] || {},
      cell = row[x] = row[x] || [],
      stamp = Util.stamp(obj)

    this._objectPoint[stamp] = point

    cell.push(obj)
  },

  updateObject: function (obj, point) {
    this.removeObject(obj)
    this.addObject(obj, point)
  },

  // Returns true if the object was found
  removeObject: function (obj, point) {
    const x = this._getCoord(point.x)
    const y = this._getCoord(point.y)
    const grid = this._grid,
      row = grid[y] = grid[y] || {},
      cell = row[x] = row[x] || []
    let i, len

    delete this._objectPoint[Util.stamp(obj)]

    for (i = 0, len = cell.length; i < len; i++) {
      if (cell[i] === obj) {
        cell.splice(i, 1)

        if (len === 1) {
          delete row[x]
        }

        return true
      }
    }
  },

  eachObject: function (fn, context) {
    let i, j, k, len, row, cell, removed
    const grid = this._grid

    for (i in grid) {
      row = grid[i]

      for (j in row) {
        cell = row[j]

        for (k = 0, len = cell.length; k < len; k++) {
          removed = fn.call(context, cell[k])
          if (removed) {
            k--
            len--
          }
        }
      }
    }
  },

  getNearObject: function (point) {
    const x = this._getCoord(point.x),
      y = this._getCoord(point.y)
    let i, j, k, row, cell, len, obj, dist
    const objectPoint = this._objectPoint
    let closestDistSq = this._sqCellSize,
      closest = null

    for (i = y - 1; i <= y + 1; i++) {
      row = this._grid[i]
      if (row) {
        for (j = x - 1; j <= x + 1; j++) {
          cell = row[j]
          if (cell) {
            for (k = 0, len = cell.length; k < len; k++) {
              obj = cell[k]
              dist = this._sqDist(objectPoint[Util.stamp(obj)], point)
              if (dist < closestDistSq
                || (dist <= closestDistSq && closest === null)) {
                closestDistSq = dist
                closest = obj
              }
            }
          }
        }
      }
    }
    return closest
  },

  _getCoord: function (x) {
    const coord = Math.floor(x / this._cellSize)
    return isFinite(coord) ? coord : x
  },

  _sqDist: function (p, p2) {
    const dx = p2.x - p.x,
      dy = p2.y - p.y
    return dx * dx + dy * dy
  },
}
