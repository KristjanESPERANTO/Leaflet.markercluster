// Config file for running Rollup in "normal" mode (non-watch)

import json from '@rollup/plugin-json'
import rollupGitVersion from 'rollup-plugin-git-version'
import process from 'node:process'

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
const pkg = JSON.parse(readFileSync('./package.json'))

let version = pkg.version
let release

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV === 'release') {
  release = true
}
else {
  release = false
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

export default [
  // ES Module build (for bundlers and import maps)
  {
    input: 'src/index.js',
    external: ['leaflet'],
    output: {
      banner,
      file: 'dist/leaflet.markercluster.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [release ? json() : rollupGitVersion()],
  },
  // Global/IIFE build (for <script> tags with global L)
  {
    input: 'src/index.js',
    external: ['leaflet'],
    output: {
      banner,
      file: 'dist/leaflet.markercluster-global.js',
      format: 'iife',
      name: 'LeafletMarkerCluster',
      sourcemap: true,
      globals: {
        leaflet: 'L',
      },
      extend: true, // Extend window.L instead of replacing it
    },
    plugins: [release ? json() : rollupGitVersion()],
  },
]
