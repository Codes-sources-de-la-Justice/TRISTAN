// @ts-nocheck
import fcose from 'cytoscape-fcose'
import cytoscape from 'cytoscape'

import { GraphWrapper } from '@Codes-sources-de-la-justice/cytoscape-react';
import {LayoutConstraints} from '../static/model';

cytoscape.use(fcose);

function debounce<F extends (...params: any[]) => void>(func: F, delay: number, { leading }: { leading?: boolean } = {}) {
	let timerId: number

	return (...args: any[]) => {
    if (!timerId && leading) {
      func(...args)
    }
    clearTimeout(timerId)

    timerId = setTimeout(() => func(...args), delay)
  }
}

type LayoutParameters = {
	constantEdgeElasticity?: number;
	nodeRepulsion?: number;
	nodeSeparation?: number;
	idealEdgeLength?: number;
};

type FastCoseGraphWrapperProps = {
	layoutParameters: LayoutParameters;
	layoutConstraints: LayoutConstraints;
};

type FastCoseLayoutParameters = FastCoseGraphWrapperProps & {};

export default class FastCoseGraphWrapper extends GraphWrapper {
	_debounced_layout: (params: FastCoseLayoutParameters) => void;
	_layout?: cytoscape.Layouts;
	_cy?: cytoscape.Core;

	constructor(props: FastCoseGraphWrapperProps) {
			super(props);

			const { layoutParameters } = props;

			this._debounced_layout = debounce(params => {
				if (!this._cy) {
					console.error('[FastCoseGraphWrapper] Cytoscape instance is not defined, layout cannot be computed!');
					return;
				}

				this._layout = this._cy.layout(
				{'name': 'fcose', 
					...params.layoutConstraints,
					nodeDimensionsIncludeLabels: true,
					randomize: true,
					//quality: "proof",
					edgeElasticity: (_: cytoscape.EdgeDefinition) => layoutParameters.constantEdgeElasticity || 0.00000001,
					nodeRepulsion: (_: cytoscape.NodeDefinition) => layoutParameters.nodeRepulsion || 0,
					nodeSeparation: layoutParameters.nodeSeparation || 1000,
					idealEdgeLength: (_: cytoscape.EdgeDefinition) => layoutParameters.idealEdgeLength || 100,
				});
				this._layout.run();
			}, 10, {leading: true});
    }

    layout (params = {}) {
        if (this._layout) {
            this._layout.stop();
            this._layout = undefined;
        }

        this._debounced_layout(Object.assign({}, params, this.props));
    }

		cyReady (cy: cytoscape.Core) {
      this._cy = cy;
    }

		componentDidUpdate(prevProps: FastCoseGraphWrapperProps) {
			const layoutKeys = [ "constantEdgeElasticity",
				"nodeRepulsion",
				"nodeSeparation",
				"idealEdgeLength",
				"layoutConstraints"
			];

			for (let key of layoutKeys) {
				if (!Object.is(prevProps[key], this.props[key])) {
					this.layout();
					break;
				}
			}
		}

    graphElementDidMount (el_component) {
        this.layout();
		}

    graphElementDidUpdate (el_component) {
        //this.layout();
		}

		render() { return super.render(); }
}

