import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react'
import reactRefresh from '@vitejs/plugin-react-refresh'

import { stat, readdir, readFile } from 'fs/promises'
import { join, basename, dirname, normalize } from 'path'
import send from 'send'
import parseUrl from 'parseurl'

import fg from 'fast-glob'


async function emitAllFilesInSrcForTarget(src, target, emitFile) {
	const fstat = await stat(src)

	let targetPath = join(target, basename(src));
	if (fstat.isDirectory()) {
		for (const file of await readdir(src)) {
			await copyToDir(join(src, file), targetPath);
		}
	} else {
		if (targetPath[0] === '/') {
			targetPath = targetPath.substr(1);
		}

		emitFile({
			fileName: targetPath,
			source: await readFile(src),
			type: 'asset'
		});
	}
}

export function emitFromDirectories(copies, options={}) {
	let viteConfig
	const { hook = 'generateBundle', makeTargetPath = (_) => '/' } = options
	copies = Array.isArray(copies) && copies.length ? copies : [];

	// TODO: add options for devmode/build mode.

	return {
		name: 'emit-from-directory',
		//apply: 'build',
		configResolved(resolvedConfig) {
			viteConfig = resolvedConfig
		},
		async configureServer(server) {
			const urls = {};
			for (const { src, dest } of copies) {
				const matchedSrcs = await fg(src, {
					expandDirectories: false,
					onlyFiles: true
				});

				const destArray = Array.isArray(dest) ? dest : [dest]

				matchedSrcs.forEach(src => {
					destArray.forEach(target => {
						const targetPath = join(makeTargetPath(viteConfig), target, basename(src));
						urls[targetPath] = src;
					});
				});
			}
			const emitFromDirectoryMiddleware = (req, res, next) => {
				const normalized = normalize(parseUrl(req).pathname);
				if (!!urls[normalized]) {
					send(req, urls[normalized])
						.pipe(res)
				} else {
					next();
				}
			};
			server.middlewares.use(emitFromDirectoryMiddleware);
		},
		[hook]: async function () {
			for (const { src, dest } of copies) {
				const matchedSrcs = await fg(src, {
					expandDirectories: false,
					onlyFiles: false
				});

				const destArray = Array.isArray(dest) ? dest : [dest]
				const destPaths = destArray.map(dst => join(makeTargetPath(viteConfig), dst))

				for (const src of matchedSrcs) {
					await Promise.all(
						destPaths.map(async (dst) => await emitAllFilesInSrcForTarget(src, dst, this.emitFile))
					);
				}
			}
		}
	}
}

export function loadPSPDFKit() {
	return emitFromDirectories([
		{ src: join(dirname(require.resolve('pspdfkit')), 'pspdfkit-lib/*'), dest: 'pspdfkit-lib' }
	]);
}

export function patchReactFloater() {
    return {
        name: 'patch-react-floater',
        transform(code, id) {
            if(id.endsWith('react-floater/es/index.js')) {
							console.log('transforming react floater', id)
                return `var global = typeof self !== undefined ? self : this;\n${code}`
            }
        }
    }
}


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [reactRefresh(), loadPSPDFKit()],
	cacheDir: '.cache/vite',
	publicDir: "assets",
	server: {
		cors: true
	},
	preview: {
		cors: true
	},
	build: {
		manifest: true
	},
	esbuild: {
		loader: 'jsx'
	},
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.js': 'jsx'
			}
		},
		include: [
			'react',
			'react-dom',
			'@testing-library/react',
			'chai',
			'wouter',
			'react-leaflet',
			'@dataesr/react-dsfr',
			'react-simple-tree-menu',
			'leaflet',
			'axios',
			'@fortawesome/free-solid-svg-icons',
			'pspdfkit',
			'react-konva',
			'use-image',
			'dagre'
		]
	}
})
