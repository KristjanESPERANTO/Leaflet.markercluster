import Leaflet, { Util } from 'leaflet'

export const DistanceGrid = Leaflet.DistanceGrid = function (cellSize) {
  this._cellSize = cellSize
  this._sqCellSize = cellSize * cellSize
  this._grid = {}
  this._objectPoint = {}
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
    this.removeObject(obj, point)
    this.addObject(obj, point)
  },

  /**
   * Removes an object from the grid at the specified point.
   * Uses an optimized swap-and-pop pattern for O(1) removal instead of O(n) splice.
   *
   * @param {Object} obj - The object to remove
   * @param {Point} point - The coordinates where the object is located
   * @returns {boolean} True if the object was found and removed, false otherwise
   */
  removeObject: function (obj, point) {
    const x = this._getCoord(point.x)
    const y = this._getCoord(point.y)
    // Optional chaining: safely access nested grid structure, returns undefined if row doesn't exist
    const cell = this._grid[y]?.[x]

    if (!cell) return false

    delete this._objectPoint[Util.stamp(obj)]

    // Find the object's position in the cell array
    const idx = cell.indexOf(obj)
    if (idx === -1) return false

    // Optimization: Swap with last element and pop (O(1) instead of splice's O(n))
    // Array order doesn't matter for spatial lookups, so we can avoid shifting elements
    if (idx < cell.length - 1) {
      // Replace target with last element
      cell[idx] = cell[cell.length - 1]
    }
    // Remove last element (always O(1))
    cell.pop()

    // Clean up: Remove empty cell from grid to save memory
    if (cell.length === 0) {
      delete this._grid[y][x]
    }

    return true
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
