import React, { useEffect } from "react";
// @ts-ignore
import CyReact from 'cytoscape-react';
import Cytoscape from 'cytoscape';

import FastCoseGraphWrapper from "./FastCoseGraphWrapper";

import './Schema.css';

function wordToTitleCase(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

function deriveAgeFromDOB(dob: string) {
	const [day, month, year] = dob.split("/");
	const msDelta = new Date() - new Date(year, month, day);
	return Math.floor(msDelta / (1000 * 3600 * 24 * 365));
}

type EdgeControllerProps = {
	cy: any;
	id: string;
	style: string;
};

function EdgeController({cy, id, style}: EdgeControllerProps) {
	const edge = cy.getElementById(id);

	useEffect(() => {
		if (edge.length > 0) {
			edge.style(style);
		}
	});

	return null;
}

type GenericNodeProps = {
	type: string;
	ghost: boolean;
	selected: boolean;
	onSelect?: (props: any, evt: any) => void;
	onUnselect?: (props: any, evt: any) => void;
};

type GenericNodeState = {
	drag: boolean;
};

function useDrag(initialValue) {
	const [drag, setDrag] = useState(initialValue);

	return {
		handleEnableDrag: () => setDrag(true),
		handleDisableDrag: () => setDrag(false),
		drag
	}
}

function GenericNode(props: GenericNodeProps) {
	const { drag, handleEnableDrag, handleDisableDrag } = useDrag(false);
	const { type, ghost, selected } = this.props
	const renderFunction = this[`render${wordToTitleCase(type)}`] || this.renderGeneric;

	const onClick = evt => {
		if (props.onSelect && !drag && !selected) {
			props.onSelect(props, evt);
		} 

		if (props.onUnselect && !drag && selected) {
			props.onUnselect(props, evt);
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
		{renderFunction()}
	</div>);
}

type SchemaProps = {
	layoutConstraints: any;
	elements: any;
	onSelect: any;
	onUnselect: any;
	layoutParameters: any;
	ghostIds: any;
	selectedIds: any;
};

type SchemaState = {
	drag: boolean;
};

class Schema extends React.Component<SchemaProps, SchemaState> {
	state: SchemaState = {
		drag: false
	};
	wrapperRef: React.RefObject<{}>;
	handleEnableDrag: () => void;
	handleDisableDrag: () => void;

	constructor(props: SchemaProps) {
		super(props);

		this.wrapperRef = React.createRef();
		this.handleOutsideClick = this.handleOutsideClick.bind(this);

		this.handleEnableDrag = () => this.setState({drag: true});
		this.handleDisableDrag = () => this.setState({drag: false});
	}

	renderNode(node, onSelect, onUnselect, ghost, selected) {
		const { id } = node
		return (
			<CyReact.NodeWrapper key={id} id={id}>
				<GenericNode {...node} onSelect={node.onSelect || onSelect} onUnselect={node.onUnselect || onUnselect} ghost={ghost} selected={selected} />
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

	componentDidMount() {
		document.addEventListener('mousedown', this.handleOutsideClick);
		document.addEventListener('mousemove', this.handleEnableDrag);
		document.addEventListener('mouseup', this.handleDisableDrag);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleOutsideClick);
		document.removeEventListener('mousemove', this.handleEnableDrag);
		document.removeEventListener('mouseup', this.handleDisableDrag);
	}

	handleOutsideClick(evt) {
		if (evt.target.nodeName === 'CANVAS' && !this.state.drag) {
			this.props.onOutClick();
		}
	}

	render() {
		const { layoutConstraints, elements, onSelect, onUnselect, layoutParameters, ghostIds, selectedIds } = this.props

		return (
			<div ref={this.wrappedRef}>
				<FastCoseGraphWrapper layoutConstraints={layoutConstraints} {...(layoutParameters || {})}>
					{elements.map(element => {
						if (element.group === 'nodes') {
							return this.renderNode({...element.data, labelWidth: 300, labelHeight: 300}, onSelect, onUnselect, (ghostIds || []).includes(element.data.id), (selectedIds || []).includes(element.data.id));
						} else if (element.group === 'edges') {
							return this.renderEdge(element.data,
								(ghostIds || []).includes(element.data.source) ||
								(ghostIds || []).includes(element.data.target));
						}
					})}
				</FastCoseGraphWrapper>
			</div>
		);
	}
}
export default Schema;
