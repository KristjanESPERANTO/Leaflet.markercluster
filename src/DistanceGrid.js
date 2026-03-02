import { Util } from 'leaflet'

/**
 * @typedef {import('leaflet').Point} Point
 */

/**
 * A spatial index structure that divides space into a grid of cells.
 * Used for efficient spatial queries and nearest neighbor lookups.
 * @param {number} cellSize - The size of each grid cell in pixels
 */
export const DistanceGrid = function (cellSize) {
  this._cellSize = cellSize
  this._sqCellSize = cellSize * cellSize
  this._grid = new Map()
  this._objectPoint = new Map()
}

DistanceGrid.prototype = {

  /**
   * Adds an object to the grid at the specified point.
   * @param {object} obj - The object to add
   * @param {Point} point - The coordinates where the object should be added
   */
  addObject: function (obj, point) {
    const x = this._getCoord(point.x),
      y = this._getCoord(point.y),
      grid = this._grid

    let row = grid.get(y)
    if (!row) {
      row = new Map()
      grid.set(y, row)
    }

    let cell = row.get(x)
    if (!cell) {
      cell = []
      row.set(x, cell)
    }

    this._objectPoint.set(Util.stamp(obj), point)

    cell.push(obj)
  },

  /**
   * Updates an object's position in the grid.
   * @param {object} obj - The object to update
   * @param {Point} point - The new coordinates for the object
   */
  updateObject: function (obj, point) {
    this.removeObject(obj, point)
    this.addObject(obj, point)
  },

  /**
   * Removes an object from the grid at the specified point.
   * Uses an optimized swap-and-pop pattern for O(1) removal instead of O(n) splice.
   * @param {object} obj - The object to remove
   * @param {Point} point - The coordinates where the object is located
   * @returns {boolean} True if the object was found and removed, false otherwise
   */
  removeObject: function (obj, point) {
    const x = this._getCoord(point.x)
    const y = this._getCoord(point.y)
    const row = this._grid.get(y)
    const cell = row?.get(x)

    if (!cell) return false

    this._objectPoint.delete(Util.stamp(obj))

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
      row.delete(x)
      if (row.size === 0) {
        this._grid.delete(y)
      }
    }

    return true
  },

  /**
   * Iterates over all objects in the grid.
   * @param {(obj: object) => boolean} fn - Callback function to call for each object
   * @param {object} context - Context for the callback function
   */
  eachObject: function (fn, context) {
    for (const row of this._grid.values()) {
      for (const cell of row.values()) {
        for (let k = 0, len = cell.length; k < len; k++) {
          const removed = fn.call(context, cell[k])
          if (removed) {
            k--
            len--
          }
        }
      }
    }
  },

  /**
   * Finds the nearest object to a given point.
   * @param {Point} point - The reference point
   * @returns {object|null} The nearest object, or null if none found
   */
  getNearObject: function (point) {
    const x = this._getCoord(point.x),
      y = this._getCoord(point.y)
    const objectPoint = this._objectPoint
    let closestDistSq = this._sqCellSize,
      closest = null

    for (let i = y - 1; i <= y + 1; i++) {
      const row = this._grid.get(i)
      if (row) {
        for (let j = x - 1; j <= x + 1; j++) {
          const cell = row.get(j)
          if (cell) {
            for (let k = 0, len = cell.length; k < len; k++) {
              const obj = cell[k]
              const dist = this._sqDist(objectPoint.get(Util.stamp(obj)), point)
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

  /**
   * Converts a coordinate to a grid cell coordinate.
   * @param {number} x - The coordinate to convert
   * @returns {number} The grid cell coordinate
   * @private
   */
  _getCoord: function (x) {
    const coord = Math.floor(x / this._cellSize)
    return isFinite(coord) ? coord : x
  },

  /**
   * Calculates the squared distance between two points.
   * @param {Point} p - First point
   * @param {Point} p2 - Second point
   * @returns {number} Squared Euclidean distance
   * @private
   */
  _sqDist: function (p, p2) {
    const dx = p2.x - p.x,
      dy = p2.y - p.y
    return dx * dx + dy * dy
  },
}
