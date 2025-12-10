# Contributing to Leaflet.MarkerCluster

1. [Reporting Bugs](#reporting-bugs)
2. [Contributing Code](#contributing-code)
3. [Development Setup](#development-setup)
4. [NPM Scripts](#npm-scripts)
5. [Testing](#testing)
6. [Releasing](#releasing)

## Reporting Bugs

Before reporting a bug on the project's [issues page](https://github.com/KristjanESPERANTO/Leaflet.markercluster/issues),
first make sure that your issue is caused by Leaflet.MarkerCluster, not your application code
(e.g. passing incorrect arguments to methods, etc.).
Second, search the already reported issues for similar cases,
and if it's already reported, just add any additional details in the comments.

After you've made sure that you've found a new Leaflet.markercluster bug,
here are some tips for creating a helpful report that will make fixing it much easier and quicker:

- Write a **descriptive, specific title**. Bad: _Problem with polylines_. Good: _Doing X in IE9 causes Z_.
- Include **browser, OS and Leaflet version** info in the description.
- Create a **simple test case** that demonstrates the bug (e.g. using [JSFiddle](http://jsfiddle.net/) or [JS Bin](http://jsbin.com/)).
- Check whether the bug can be reproduced in **other browsers**.
- Check if the bug occurs in the stable version, main, or both.
- _Bonus tip:_ if the bug only appears in the main version but the stable version is fine,
  use `git bisect` to find the exact commit that introduced the bug.

## Contributing Code

### Considerations for Accepting Patches

While we happily accept patches, we're also committed to keeping Leaflet simple, lightweight and blazingly fast.
So bugfixes, performance optimizations and small improvements that don't add a lot of code
are much more likely to get accepted quickly.

Before sending a pull request with a new feature, check if it's been discussed before already
on [GitHub issues](https://github.com/KristjanESPERANTO/Leaflet.markercluster/issues),
and ask yourself two questions:

1. Are you sure that this new feature is important enough to justify its presence in the Leaflet core?
   Or will it look better as a plugin in a separate repository?
2. Is it written in a simple, concise way that doesn't add bulk to the codebase?

If your feature or API improvement did get merged into main branch,
please consider submitting another pull request with the corresponding documentation update.

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Please format your commit messages accordingly:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

## Development Setup

Install the dependencies:

```bash
npm install
```

This will also set up Git hooks for automatic linting on commit.

## NPM Scripts

| Script                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run build`         | Lint, fix, and build the project to `dist/`                       |
| `npm run lint`          | Check for linting errors (ESLint + Prettier)                      |
| `npm run lint:fix`      | Automatically fix linting errors                                  |
| `npm test`              | Run linting, build, and all tests                                 |
| `npm run release`       | Create a new release (bump version, update changelog, create tag) |
| `npm run release:alpha` | Create a new alpha release                                        |
| `npm run release:dry`   | Preview what a release would do (dry run)                         |

### Build Output

The build creates a single ES module in `dist/`:

- `leaflet.markercluster.js` - ES Module for bundlers and modern browsers

## Testing

To run the full test suite:

```bash
npm test
```

This will:

1. Run ESLint and Prettier checks
2. Build the project
3. Run Playwright browser tests (179 tests in Chromium)

The test suite uses Mocha + Chai for assertions and Playwright for browser automation. Make sure all tests pass before submitting a pull request.

## Releasing

Releases are created using [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version):

```bash
# Preview what will happen
npm run release:dry

# Create an alpha release (e.g., 3.0.0-alpha.2)
npm run release:alpha

# Create a stable release
npm run release

# Push the release
git push --follow-tags origin main

# Publish to npm
npm publish
```

The release script will:

- Bump the version in `package.json` based on conventional commits
- Update `CHANGELOG.md` with all changes since the last release
- Create a git commit and tag
