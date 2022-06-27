// @ts-nocheck

import React, { useEffect, useState, MouseEvent, CSSProperties, MouseEventHandler } from "react";
import { NodeWrapper, EdgeWrapper } from '@codes-sources-de-la-justice/cytoscape-react';
import Cytoscape from 'cytoscape';

import FastCoseGraphWrapper from "./FastCoseGraphWrapper";
import type { GenericNodeData } from '../static';
import { GenericNodeType } from '../static';

import { match } from 'ts-pattern'

//import './Schema.css';
import {FactNode, PersonNode} from "../components/nodes";

function wordToTitleCase(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

type EdgeControllerProps = {
	cy?: Cytoscape.Core;
	id?: string;
	style: CSSProperties;
};

function EdgeController({cy, id, style}: EdgeControllerProps) {
	useEffect(() => {
		if (cy && id) {
			const edge = cy.getElementById(id);
			if (edge.length > 0) {
				edge.style(style);
			}
		}
	}, [cy, id]);

	return null;
}

type GenericNodeProps = {
	node: GenericNodeData;
	ghost: boolean;
	selected: boolean;
	onSelect?: (node: GenericNodeData, props?: any, evt?: any) => void;
	onUnselect?: (node: GenericNodeData, props?: any, evt?: any) => void;
};

type GenericNodeState = {
	drag: boolean;
};

function useDrag(initialValue: boolean) {
	const [drag, setDrag] = useState(initialValue);

	return {
		handleEnableDrag: () => setDrag(true),
		handleDisableDrag: () => setDrag(false),
		drag
	}
}

function GenericNode(props: GenericNodeProps) {
	const { drag, handleEnableDrag, handleDisableDrag } = useDrag(false);
	const { node, ghost, selected } = props

	const onClick = (evt: MouseEvent) => {
		if (props.onSelect && !drag && !selected) {
			props.onSelect(node, props, evt);
		} 

		if (props.onUnselect && !drag && selected) {
			props.onUnselect(node, props, evt);
		}
	};

	const classNames = [ "cytoscape-react-node" ];

	if (selected) {
		classNames.push("node-selected");
	}

	if (ghost) {
		classNames.push("ghost");
	}

	return (
	<div
		className={classNames.join(' ')}
		onMouseUp={onClick}
		onMouseMove={handleEnableDrag}
		onMouseDown={handleDisableDrag}>
		{match(node)
			.with({ type: GenericNodeType.Fact }, ({ entity }) => (<FactNode fact={entity} />))
			.with({ type: GenericNodeType.Person }, ({ entity }) => (<PersonNode person={entity} />))
			.exhaustive()
		}
	</div>);
}

type SchemaProps = {
	layoutConstraints: any;
	elements: Cytoscape.ElementDefinition[];
	onSelect: (node: GenericNodeData, props?: any, evt?: any) => void;
	onUnselect: (node: GenericNodeData, props?: any, evt?: any) => void;
	layoutParameters: any;
	ghostIds: string[];
	selectedIds: string[];
	onOutClick: () => void;
};

type SchemaState = {
	drag: boolean;
};

function isNode(node: Cytoscape.ElementDefinition): node is Cytoscape.NodeDefinition {
	return node.group === 'nodes';
}

function isGenericNode(node: Cytoscape.ElementDefinition): node is Cytoscape.NodeDefinition & { data: GenericNodeData } {
	return isNode(node) && node.data.id != null && node.data['type'] != null && typeof node.data['type'] === 'string';
}

function isEdge(node: Cytoscape.ElementDefinition): node is Cytoscape.EdgeDefinition {
	return node.group === 'edges';
}


class Schema extends React.Component<SchemaProps, SchemaState> {
	override state: SchemaState = {
		drag: false
	};
	wrapperRef: React.RefObject<HTMLDivElement>;
	handleEnableDrag: () => void;
	handleDisableDrag: () => void;

	constructor(props: SchemaProps) {
		super(props);

		this.wrapperRef = React.createRef();
		this.handleOutsideClick = this.handleOutsideClick.bind(this);

		this.handleEnableDrag = () => this.setState({drag: true});
		this.handleDisableDrag = () => this.setState({drag: false});
	}

	renderNode(node: GenericNodeData,
						 onSelect: (node: GenericNodeData, props?: any, evt?: any) => void,
						 onUnselect: (node: GenericNodeData, props?: any, evt?: any) => void,
						 ghost: boolean, selected: boolean) {
		const { id } = node
		return (
			<NodeWrapper key={id} id={id}>
				<GenericNode node={node} onSelect={node['onSelect'] || onSelect} onUnselect={node['onUnselect'] || onUnselect} ghost={ghost} selected={selected} />
			</NodeWrapper>
		);
	}

	renderEdge({source, target, id}: Cytoscape.EdgeDataDefinition, ghost: boolean) {
		return (
			<EdgeWrapper className='' key={id} id={id} source={source} target={target} canvasClassName=''>
				<EdgeController
					style={{ opacity: ghost ? 0.1 : 1 }} />
			</EdgeWrapper>
		);
	}

	override componentDidMount() {
		document.addEventListener('mousedown', this.handleOutsideClick);
		document.addEventListener('mousemove', this.handleEnableDrag);
		document.addEventListener('mouseup', this.handleDisableDrag);
	}

	override componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleOutsideClick);
		document.removeEventListener('mousemove', this.handleEnableDrag);
		document.removeEventListener('mouseup', this.handleDisableDrag);
	}

	handleOutsideClick(evt: Event) {
		if (evt.target instanceof Element && evt.target.nodeName === 'CANVAS' && !this.state.drag) {
			this.props.onOutClick();
		}
	}

	override render() {
		const { layoutConstraints, elements, onSelect, onUnselect, layoutParameters, ghostIds, selectedIds } = this.props

		return (
		 <div ref={this.wrapperRef}>
			 {/* @ts-ignore */}
				<FastCoseGraphWrapper
					layoutConstraints={layoutConstraints}
					layoutParameters={layoutParameters}>
					{elements.map(element => {
						if (isGenericNode(element)) {
							return this.renderNode(
								element.data,
								onSelect,
								onUnselect,
								(ghostIds || []).includes(element.data.id),
								(selectedIds || []).includes(element.data.id)
							);
						} else if (isEdge(element)) {
							return this.renderEdge(element.data,
								(ghostIds || []).includes(element.data.source) ||
								(ghostIds || []).includes(element.data.target));
						} else {
							throw new Error('Unreachable code');
						}
					})}
				</FastCoseGraphWrapper>
			</div>
		);
	}
}
export default Schema;
