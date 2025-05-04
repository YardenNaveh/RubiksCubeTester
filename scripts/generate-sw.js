import { injectManifest } from 'workbox-build';

const swSrc = './src/sw.js'; // Your custom service worker source
const swDest = './dist/sw.js'; // Destination for the built service worker

const config = {
  swSrc,
  swDest,
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{js,css,html,png,svg,jpg,jpeg,gif,woff,woff2,wav}', // Adjust patterns as needed
  ],
  // Other workbox configuration options...
};

injectManifest(config)
  .then(({ count, size }) => {
    console.log(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`);
  })
  .catch(error => {
    console.error(`Service worker generation failed: ${error}`);
  }); 