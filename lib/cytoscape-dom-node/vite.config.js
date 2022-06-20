// vite.config.js
import path from 'path'
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'cytoscape-dom-node',
      fileName: (format) => `cytoscape-dom-node.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['cytoscape'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          cytoscape: 'Cytoscape',
        }
      }
    }
  }
})
