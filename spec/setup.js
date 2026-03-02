import { Window } from 'happy-dom'

// Setup happy-dom as global DOM environment
const window = new Window({
  url: 'https://localhost:3000',
})

global.window = window
global.document = window.document
global.HTMLElement = window.HTMLElement
global.Element = window.Element
global.Node = window.Node
global.NodeList = window.NodeList
// NOTE: do NOT override global.Event / global.CustomEvent / global.MouseEvent –
// those are Node.js built-ins that Chai internals rely on.
// Leaflet resolves them from window.* which is also set above.

// Expose DOM API needed by Leaflet
global.SVGElement = window.SVGElement
global.SVGSVGElement = window.SVGSVGElement ?? window.SVGElement

// Leaflet reads navigator.userAgent on load
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Linux x86_64',
    language: 'en-US',
    languages: ['en-US', 'en'],
  },
  writable: true,
  configurable: true,
})

// Leaflet uses requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 16)
global.cancelAnimationFrame = id => clearTimeout(id)

// Leaflet reads screen size
Object.defineProperty(global, 'screen', {
  value: {
    width: 1280,
    height: 800,
  },
  writable: true,
  configurable: true,
})

// Needed for Leaflet's getBoundingClientRect calls
if (!window.HTMLElement.prototype.getBoundingClientRect) {
  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 200,
    height: 200,
    top: 0,
    left: 0,
    bottom: 200,
    right: 200,
    x: 0,
    y: 0,
  })
}

// Leaflet calls getComputedStyle globally
global.getComputedStyle = window.getComputedStyle.bind(window)

// happy-dom returns 0 for clientWidth/clientHeight even when style.width is set.
// Leaflet uses these to determine the map container size.
// Parse inline style dimensions so Leaflet sees the correct size.
function parsePx(value) {
  const n = parseFloat(value)
  return isFinite(n) ? n : 0
}
const _clientWidthDescriptor = Object.getOwnPropertyDescriptor(window.Element.prototype, 'clientWidth')
const _clientHeightDescriptor = Object.getOwnPropertyDescriptor(window.Element.prototype, 'clientHeight')
Object.defineProperties(window.HTMLElement.prototype, {
  clientWidth: {
    get() {
      const fromStyle = parsePx(this.style?.width)
      if (fromStyle > 0) return fromStyle
      return _clientWidthDescriptor ? _clientWidthDescriptor.get.call(this) : 0
    },
    configurable: true,
  },
  clientHeight: {
    get() {
      const fromStyle = parsePx(this.style?.height)
      if (fromStyle > 0) return fromStyle
      return _clientHeightDescriptor ? _clientHeightDescriptor.get.call(this) : 0
    },
    configurable: true,
  },
})
