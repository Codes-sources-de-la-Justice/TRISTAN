const path = require('path')
const { override, addExternalBabelPlugins } = require('customize-cra')

module.exports = {
	paths: function (paths, env) {
		paths.appPublic = path.resolve(__dirname, 'src/assets')
		paths.appHtml = path.resolve(__dirname, 'src/assets/index.html')
		paths.appIndexJs = path.resolve(__dirname, 'src/frontend/index.js')
		paths.swSrc = path.resolve(__dirname, 'src/frontend/service-worker.js')

		return paths
	},
	webpack: override(
		...addExternalBabelPlugins(
			"@babel/plugin-proposal-nullish-coalescing-operator"
		)
	)
}
