import React, { useState, useEffect } from "react";
import CytoscapeComponent from 'react-cytoscapejs';

import fcose from 'cytoscape-fcose'
import cytoscape from 'cytoscape'

import CyReact from 'cytoscape-react';

import { Badge } from '@dataesr/react-dsfr';
import UserIcon from 'remixicon-react/UserLineIcon';

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
	},
	{
		selector: "node:selected",
		style: {
			backgroundColor: "green"
		}
	},
	{
		selector: ".ghost",
		style: {
			opacity: 0.1
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

		componentDidUpdate(prevProps, prevState, snapshot) {
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

function wordToTitleCase(str) {
	return str[0].toUpperCase() + str.substr(1);
}

function deriveAgeFromDOB(dob) {
	const [day, month, year] = dob.split("/");
	const msDelta = new Date() - new Date(year, month, day);
	return Math.floor(msDelta / (1000 * 3600 * 24 * 365));
}

function EdgeController({cy, id, style}) {
	const edge = cy.getElementById(id);

	useEffect(() => {
		if (edge.length > 0) {
			edge.style(style);
		}
	});

	return null;
}

class GenericNode extends CyReact.Node {
	constructor(props) {
		super(props);
		this.state = {
			selected: false
		}
	}

	renderPerson() {
		const person = this.props;
		const age = deriveAgeFromDOB(person.Naissance_Date);
		return (
			<>
				<div className="node-header">
					<UserIcon />
					<Badge className="flush-right" text={person.role} type="warning" colorFamily={person.role === "VICTIME" ? "yellow-tournesol" : undefined} icon={false} />
				</div>
				<h3>{person.Nom} {person.Prenom}</h3>
				{/*<p>{age} ans</p>
				<p>{person.Personne_Profession["#text"]}</p>
				<p>{person.Personne_Commune_Residence} {person.Personne_CP_Commune_Residence}</p>*/}
			</>
		);
	}
	renderFact() {
		const fact = this.props;
		return (
			<>
				<div className="node-header">
					<p>{fact.Natinf} <i>{fact.Qualification}</i></p>
					<Badge className="flush-right" text="Faits" type="info" icon={false} />
				</div>
				<p style={{fontWeight: "bold"}}>{fact.Libelle}</p>
				{/*<hr />
				<div>
					<span>{fact.start_date}</span>
					-&gt;
					<span>{fact.end_date}</span>
				</div>
				<hr />
				<p>TODO: mettre le lieu</p>*/}
			</>
		);
	}
	renderGeneric() {
		return (
			<div>{this.props.label}</div>
		);
	}
	render() {
		const { type, ghost } = this.props
		const { selected } = this.state

		const renderFunction = this[`render${wordToTitleCase(type)}`] || this.renderGeneric;

		const onClick = evt => {
			this.setState(state => {
				if (!state.selected && this.props.onSelect) {
					this.props.onSelect(this.props, evt);
				} else if (state.selected && this.props.onUnselect) {
					this.props.onUnselect(this.props, evt);
				}

				return {
					selected: !state.selected
				};
			});
		};

		const classNames = [ "cytoscape-react-node" ];

		if (selected) {
			classNames.push("node-selected");
		}

		if (ghost) {
			classNames.push("ghost");
		}

		return (
		<div className={classNames.join(' ')} onClick={onClick}>
			{renderFunction.call(this)}
		</div>);
	}
}

class Schema extends React.Component {
	renderNode(node, onSelect, onUnselect, ghost) {
		const { id } = node
		return (
			<CyReact.NodeWrapper key={id} id={id}>
				<GenericNode {...node} onSelect={node.onSelect || onSelect} onUnselect={node.onUnselect || onUnselect} ghost={ghost} />
			</CyReact.NodeWrapper>
		);
	}

	renderEdge({source, target, id}, ghost) {
		return (
			<CyReact.EdgeWrapper className='' key={id} id={id} source={source} target={target} canvasClassName=''>
				<EdgeController style={
					{ opacity: ghost ? 0.1 : 1 }} />
			</CyReact.EdgeWrapper>
		);
	}

	render() {
		const { layoutConstraints, elements, onSelect, onUnselect, layoutParameters, ghostIds } = this.props

		return (
			<FastCoseGraphWrapper layoutConstraints={layoutConstraints} {...(layoutParameters || {})}>
				{elements.map(element => {
					if (element.group === 'nodes') {
						return this.renderNode({...element.data, labelWidth: 300, labelHeight: 300}, onSelect, onUnselect, (ghostIds || []).includes(element.data.id));
					} else if (element.group === 'edges') {
						return this.renderEdge(element.data,
							(ghostIds || []).includes(element.data.source) ||
							(ghostIds || []).includes(element.data.target));
					}
				})}
			</FastCoseGraphWrapper>
		);
	}
}

export default Schema;
