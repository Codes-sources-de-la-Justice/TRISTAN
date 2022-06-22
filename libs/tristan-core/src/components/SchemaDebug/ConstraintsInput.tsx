// @ts-nocheck
import { useState } from 'react'
import Cytoscape from 'cytoscape'

import { NodeSelect } from './NodeSelect'

type ConstraintInputProps = {
	nodes: Cytoscape.NodeDefinition[];
	onAdd: (n: Cytoscape.NodeDefinition, x: number, y: number) => void;
};


export function RelativePlacementConstraintInput({nodes, onAdd}: ConstraintInputProps) {
	const [state, setState] = useState({u: nodes[0], v: nodes[0], direction: 'left-right', gap: null});

	return (
		<div>
			<NodeSelect nodes={nodes} value={state.u} onSelect={node => setState({...state, u})} />
			<select choices={['left-right', 'top-bottom']} value={state.direction} /> Gap: <input type="text" />
			<button>Ajouter</button>
			<NodeSelect nodes={nodes} value={state.v} onSelect={v => setState({...state, v})} />
		</div>
	);
}

export function FixedPlacementNodeInput({nodes, onAdd} : ConstraintInputProps) {
	const [state, setState] = useState({node: nodes[0], x: 113, y: -84});

	return (
		<div>
			<NodeSelect nodes={nodes} value={state.node} onSelect={node => setState({...state, node})} />
			<span>
				<label for="x_input">x: </label><input type="text" id="x_input" value={state.x} />
				<label for="y_input">y: </label><input type="text" id="y_input" value={state.y} />
			</span>
			<button onClick={() => onAdd(state.node, state.x, state.y)}>Ajouter</button>
		</div>
	);
}


