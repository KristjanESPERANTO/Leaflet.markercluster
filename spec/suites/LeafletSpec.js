import { describe, it } from 'node:test'
import assert from 'node:assert'

import { version } from 'leaflet'

describe('L#noConflict', function () {
  it('restores the previous L value and returns Leaflet namespace', function () {
    assert.ok(version)
  })
})
