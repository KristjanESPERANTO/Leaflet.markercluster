if (!Array.prototype.map) {
  Array.prototype.map = function (fun /* , thisp */) {
    'use strict'

    if (this === void 0 || this === null)
      throw new TypeError()

    const t = Object(this)
    const len = t.length >>> 0
    if (typeof fun !== 'function')
      throw new TypeError()

    const res = new Array(len)
    const thisp = arguments[1]
    for (let i = 0; i < len; i++) {
      if (i in t)
        res[i] = fun.call(thisp, t[i], i, t)
    }

    return res
  }
}

Number.isFinite = Number.isFinite || function (value) {
  return typeof value === 'number' && isFinite(value)
}
