// Navigation helper for examples
const examples = [
  'marker-clustering.html',
  'marker-clustering-everything.html',
  'marker-clustering-custom.html',
  'marker-clustering-convexhull.html',
  'marker-clustering-dragging.html',
  'marker-clustering-geojson.html',
  'marker-clustering-pane.html',
  'marker-clustering-zoomtobounds.html',
  'marker-clustering-zoomtoshowlayer.html',
  'marker-clustering-spiderfier.html',
  'marker-clustering-singlemarkermode.html',
  'marker-clustering-realworld.388.html',
  'marker-clustering-realworld.10000.html',
  'marker-clustering-realworld.50000.html',
  'marker-clustering-realworld-mobile.388.html',
  'marker-clustering-realworld-maxzoom.388.html',
  'geojson.html',
  'remove-geoJSON-when-spiderfied.html',
]

// Get current page filename
const currentPage = window.location.pathname.split('/').pop()
const currentIndex = examples.indexOf(currentPage)

// Create navigation HTML
if (currentIndex !== -1) {
  const navContainer = document.querySelector('.nav-buttons')

  if (navContainer) {
    // Add next button if not last example
    if (currentIndex < examples.length - 1) {
      const nextButton = document.createElement('a')
      nextButton.href = examples[currentIndex + 1]
      nextButton.className = 'next-button'
      nextButton.textContent = 'Next Example'
      navContainer.appendChild(nextButton)
    }
  }
}
