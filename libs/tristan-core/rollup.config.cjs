const nrwlConfig = require('@nrwl/react/plugins/bundle-rollup')
const styles = require('rollup-plugin-styles')

module.exports = (config) => {
    const nxConfig = nrwlConfig(config)
    const newConfig = {
        ...nxConfig,
        output: {
            ...nxConfig.output,
            assetFileNames: "[name]-[hash][extname]"
        },
        plugins: [
            ...nxConfig.plugins.filter(plugin => !['postcss'].includes(plugin.name)),
            styles()
        ]
    }
    return newConfig
}
