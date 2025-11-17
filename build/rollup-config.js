// Config file for running Rollup in "normal" mode (non-watch)

import json from '@rollup/plugin-json'
import process from 'node:process'

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
const pkg = JSON.parse(readFileSync('./package.json'))

let version = pkg.version

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV !== 'release') {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  const rev = execSync('git rev-parse --short HEAD').toString().trim()
  version += '+' + branch + '.' + rev
}

const banner = `/*! *****************************************************************************
  ${pkg.name}
  Version ${version}

  ${pkg.description}
  Please submit bugs at ${pkg.bugs.url}

  © Dave Leaver and contributors
  License: ${pkg.license}

  This file is auto-generated. Do not edit.
***************************************************************************** */
`

export default {
  input: 'src/index.js',
  external: ['leaflet'],
  output: {
    banner,
    file: 'dist/leaflet.markercluster.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [json()],
}
