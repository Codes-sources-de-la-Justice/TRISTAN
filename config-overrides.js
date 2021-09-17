const path = require('path')

module.exports = {
	paths: function (paths, env) {
		paths.appPublic = path.resolve(__dirname, 'src/assets')
		paths.appHtml = path.resolve(__dirname, 'src/assets/index.html')
		paths.appIndexJs = path.resolve(__dirname, 'src/frontend/index.js')

		return paths
	}
}
