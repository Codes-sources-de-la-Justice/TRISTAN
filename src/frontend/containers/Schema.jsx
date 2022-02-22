import React from "react";
import CytoscapeComponent from 'react-cytoscapejs';

import fcose from 'cytoscape-fcose'
import cytoscape from 'cytoscape'

import CyReact from 'cytoscape-react';

import './Schema.css';

cytoscape.use(fcose);

const stylesheet = [
	{
		selector: "node",
		style: {
			shape: "rectangle",
			label: "data(label)",
			width: 150,
			height: 150,
			"text-max-width": 150,
			"text-wrap": "wrap", 
			"text-halign": "center",
			"text-valign": "center",
		}
	}
];

function OldSchema({elements, layoutConstraints}) {
	return (<CytoscapeComponent
		elements={elements}
		layout={{name: "fcose", ...layoutConstraints, idealEdgeLength: node => 150}}
		style={{width: "100vw", height: "100vh"}}
		stylesheet={stylesheet}
	/>);
}

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

class FastCoseGraphWrapper extends CyReact.GraphWrapper {
	constructor(props) {
			super(props);
			this._debounced_layout = debounce(() => {
				this._layout = this._cy.layout(
				{'name': 'fcose', 
					...props.layoutConstraints,
					//nodeDimensionsIncludeLabels: true,
					randomize: true,
					quality: "proof",
					nodeSeparation: 5000,
					nodeRepulsion: node => 9999999,
					idealEdgeLength: edge => 200
				});
				this._layout.run();
			}, 10, {leading: true});
    }

    layout (params = {}) {
        if (this._layout) {
            this._layout.stop();
            this._layout = undefined;
        }

        this._debounced_layout(params);
    }

    cyReady (cy) {
      this._cy = cy;
			window._cy = cy;
			window.rerun_layout = () => this.layout();
    }

    graphElementDidMount (el_component) {
        this.layout();
    }

    graphElementDidUpdate (el_component) {
        this.layout();
    }
}

function wordToTitleCase(str) {
	return str[0].toUpperCase() + str.substr(1);
}

function deriveAgeFromDOB(dob) {
	const [day, month, year] = dob.split("/");
	const msDelta = new Date() - new Date(year, month, day);
	return Math.floor(msDelta / (1000 * 3600 * 24 * 365));
}

class GenericNode extends CyReact.Node {
	renderPerson() {
		const person = this.props.metadata;
		const age = deriveAgeFromDOB(person.Personne_Naissance_Date);
		return (
			<div>
				<h3>{person.Personne_Nom} {person.Personne_Prenom}</h3>
				<p>{age} ans</p>
				<p>{person.Personne_Profession["#text"]}</p>
				<p>{person.Personne_Commune_Residence} {person.Personne_CP_Commune_Residence}</p>
			</div>
		);
	}
	renderFact() {
		const fact = this.props.metadata;
		return (
			<div>
				<p style={{fontWeight: "bold"}}>{fact.libelle}</p>
				<hr />
				<div>
					<span>{fact.start_date}</span>
					->
					<span>{fact.end_date}</span>
				</div>
				<hr />
				<p>TODO: mettre le lieu</p>
			</div>
		);
	}
	renderGeneric() {
		return (
			<div>{this.props.label}</div>
		);
	}
	render() {
		const { type } = this.props

		const renderFunction = this[`render${wordToTitleCase(type)}`] || this.renderGeneric;

		return renderFunction.call(this);
	}
}

class Schema extends CyReact.Graph {
	renderNode(node) {
		const { id } = node
		return (
			<CyReact.NodeWrapper key={id} id={id}>
				<GenericNode {...node} />
			</CyReact.NodeWrapper>
		);
	}

	renderEdge({source, target, id}) {
		return (
			<CyReact.EdgeWrapper key={id} id={id} source={source} target={target} />
		);
	}

	render() {
		const { layoutConstraints, elements } = this.props
		return (
			<FastCoseGraphWrapper layoutConstraints={layoutConstraints}>
				{elements.map(element => {
					if (element.group === 'nodes') {
						return this.renderNode({...element.data, labelWidth: 300, labelHeight: 300});
					} else if (element.group === 'edges') {
						return this.renderEdge(element.data);
					}
				})}
			</FastCoseGraphWrapper>
		);
	}
}

export default Schema;
