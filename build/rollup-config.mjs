
// Config file for running Rollup in "normal" mode (non-watch)

import rollupGitVersion from 'rollup-plugin-git-version'
import json from 'rollup-plugin-json'
import process from 'node:process';

import { readFileSync } from "fs";
import { execSync } from 'child_process';
const pkg = JSON.parse(readFileSync("./package.json"));

let version = pkg.version;
let release;

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV === 'release') {
	release = true;
} else {
	release = false;
	const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
	const rev = execSync('git rev-parse --short HEAD').toString().trim();
	version += '+' + branch + '.' + rev;
}

const banner = `/*
 * Leaflet.markercluster ` + version + `,
 * Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 * https://github.com/Leaflet/Leaflet.markercluster
 * (c) 2012-2017, Dave Leaver, smartrak
 */`;

export default {
	input: 'src/index.js',
	output: {
		banner,
		file: 'dist/leaflet.markercluster-src.js',
		format: 'umd',
		legacy: true, // Needed to create files loadable by IE8
		name: 'Leaflet.markercluster',
		sourcemap: true,
	},
	plugins: [
		release ? json() : rollupGitVersion(),
	],
};
