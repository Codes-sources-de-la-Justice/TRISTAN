const path = require('path')
const vite = require('vite')

function withVite (extraParams) {
  let server;

  return {
    name: "vite-plugin",

    async serverStart({ app }) {
      server = await vite.createServer({
        clearScreen: false,
				...extraParams
      });
      await server.listen();
      const port = server.config.server.port;
      const protocol = server.config.server.https ? "https" : "http";
      app.use((ctx, _) => {
        ctx.redirect(`${protocol}://localhost:${port}${ctx.originalUrl}`);
        return;
      });
    },

    async serverStop() {
      return server.close();
    },
  };
};

const ignoredBrowserLogs = [
  '[vite] connecting...',
  '[vite] connected.',
];

module.exports = {
  plugins: [
    withVite({
			configFile: path.join(__dirname, 'vite.config.js')
		}),
  ],
  coverageConfig: {
    include: [
      '**/*.{js,jsx,ts,tsx}'
    ]
  },
  testRunnerHtml: testFramework => `
    <html>
      <head>
        <script type="module">
          // Note: globals expected by @testing-library/react
          window.global = window;
          window.process = { env: {} };

          // Note: adapted from https://github.com/vitejs/vite/issues/1984#issuecomment-778289660
          // Note: without this you'll run into https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201
          window.__vite_plugin_react_preamble_installed__ = true;
        </script>
        <script type="module" src="${testFramework}"></script>
      </head>
    </html>
  `,
  filterBrowserLogs: ({ args }) => {
    return !args.some((arg) => ignoredBrowserLogs.includes(arg));
  },
};
