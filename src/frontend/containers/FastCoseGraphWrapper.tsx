import fcose from 'cytoscape-fcose'
import CyReact from 'cytoscape-react';
import cytoscape from 'cytoscape'
import {LayoutConstraints} from 'static/model';

cytoscape.use(fcose);

const debounce = (func, delay, { leading } = {}) => {
  let timerId

  return (...args) => {
    if (!timerId && leading) {
      func(...args)
    }
    clearTimeout(timerId)

    timerId = setTimeout(() => func(...args), delay)
  }
}

type FastCoseGraphWrapperProps = {
	constantEdgeElasticity?: number;
	nodeRepulsion?: number;
	nodeSeparation?: number;
	idealEdgeLength?: number;
	layoutConstraints: LayoutConstraints;
};

export default class FastCoseGraphWrapper extends CyReact.GraphWrapper {
	constructor(props: FastCoseGraphWrapperProps) {
			super(props);
			this._debounced_layout = debounce(params => {
				this._layout = this._cy.layout(
				{'name': 'fcose', 
					...params.layoutConstraints,
					nodeDimensionsIncludeLabels: true,
					randomize: true,
					//quality: "proof",
					edgeElasticity: edge => params.constantEdgeElasticity || 0.00000001,
					nodeRepulsion: node => params.nodeRepulsion || 0,
					nodeSeparation: params.nodeSeparation || 1000,
					idealEdgeLength: edge => params.idealEdgeLength || 100,
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

    cyReady (cy) {
      this._cy = cy;
			window._cy = cy;
			window.rerun_layout = () => this.layout();
    }

		componentDidUpdate(prevProps: FastCoseGraphWrapperProps, prevState, snapshot) {
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
}

