// vite.config.js
import path from 'path'
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'cytoscape-react',
      fileName: (format) => `cytoscape-react.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'react-dom', 'cytoscape'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          reactDom: 'ReactDOM',
          react: 'React',
          cytoscape: 'Cytoscape',
        }
      }
    }
  }
})
