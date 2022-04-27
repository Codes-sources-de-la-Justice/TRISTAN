import React, { useState, useCallback, useRef, useEffect, ChangeEventHandler, ChangeEvent } from 'react';
import Schema from '../containers/Schema';
import { toBackendPayload, toGraph, getClosedNeighborWithDepth } from '../static';
import { db } from '../static/db';
import { Select } from '@dataesr/react-dsfr';
import Cytoscape, {LayoutOptions} from 'cytoscape';
import './DemoSchema.css';
import {LayoutConstraints} from 'static/model';

function useOnClickOutside<T>(ref: React.RefObject<T>, callback: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
		function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target)) {
				callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function getEntity(id: string, elements: Cytoscape.ElementDefinition[]) {
	return elements.find(item => item.data.id === id);
}

function showName(e?: Cytoscape.ElementDefinition | null): string {
	if (!e) return "entité non trouvée";

	if (e.data.type === 'person') {
		return `${e.data.Nom} ${e.data.Prenom[0]}.`;
	} else if (e.data.type === 'fact') {
		return `${e.data.Natinf}`;
	} else {
		return "entité inconnue";
	}
}

function viewName(id: string, elements: Cytoscape.ElementDefinition[]): string {
	const e = getEntity(id, elements);

	return showName(e);
}

function NodeSelect({nodes, value, onSelect}: { nodes: Cytoscape.NodeDefinition[], value: any, onSelect: (selected: string) => void }) {
	const onChange = (evt: ChangeEvent<HTMLSelectElement>) => {
		onSelect(evt.target.value);
	};
	const options = nodes.map(node => ({
		label: showName(node),
		value: node.data.id
	}));

	return (
		<Select
			options={options}
			selected={value}
			onChange={onChange}
		/>
	);
}

type ConstraintInputProps = {
	nodes: Cytoscape.NodeDefinition[];
	onAdd: (n: Cytoscape.NodeDefinition, x: number, y: number) => void;
};

function FixedPlacementNodeInput({nodes, onAdd} : ConstraintInputProps) {
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

function RelativePlacementConstraintInput({nodes, onAdd}: ConstraintInputProps) {
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

type ConstraintListProps = {
	nodes: Cytoscape.NodeDefinition[];
	constraints: LayoutConstraints;
};

function ConstraintList({constraints: { alignmentConstraint, relativePlacementConstraint }, nodes}: ConstraintListProps) {
	const { horizontal, vertical } = alignmentConstraint || {}
	const showAlignmentConstraint = nature => cs => {
		return (cs || []).map((css, index) => {
				const ids = css.join('-');
				const del = index => {
				};
				return (
						<tr key={ids}>
							<td>Alignement</td>
							<td>{css.map(id => viewName(id, nodes)).join(', ')}</td>
							<td>{nature}</td>
							<td><button onClick={() => del(index)}>Supprimer</button></td>
					</tr>
						);
			});
	};

	return (
		<table>
			<thead>
				<tr>
					<td>Type</td>
					<td>Noeud</td>
					<td>Nature</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				{showAlignmentConstraint("Horizontal")(horizontal)}
				{showAlignmentConstraint("Vertical")(vertical)}
				{(relativePlacementConstraint || []).map(rpcs => {
					return null;
				})}
			</tbody>
		</table>
	);
}

type DebugBarLayoutProps = {
	onChangeConstraints: (constraints: LayoutConstraints) => void;
	onChangeLayout: () => void;
	constraints: LayoutConstraints;
	elements: Cytoscape.ElementDefinition[];
	layoutParameters: any;
};

function DebugBarLayout({onChangeConstraints, onChangeLayout, constraints, elements, layoutParameters}: DebugBarLayoutProps) {
	const { alignmentConstraint, relativePlacementConstraint } = constraints;
	const { constantEdgeElasticity, nodeRepulsion, nodeSeparation, idealEdgeLength } = layoutParameters
	const alignAllType = (type, extra={}) => evt => {
		console.log(type, extra, evt.target.checked);

		const newConstraint = elements
			.filter(item => item.data.type === type && Object.entries(extra).every(([key, value]) => item.data[key] === value))
			.map(item => item.data.id);

		const isGroupType = (constraints: string[], type: string, extra: any) => {
			return constraints.every(id => {
				const elt = elements.find(item => item.data.id === id);

				return elt?.data.type === type && Object.entries(extra).every(([key, value]) => elt?.data[key] === value)
			});
		};

		onChangeConstraints({
			alignmentConstraint: {
				horizontal: ([...(alignmentConstraint?.horizontal || []), newConstraint]).filter(cs => evt.target.checked || !isGroupType(cs, type, extra))
			},
			relativePlacementConstraint
		});
	}

	const addFixedPlacementConstraint = (nodeId, x, y) => {
	};

	const addAlignmentConstraint = (selection, direction) => {
	};

	const addRelativePlacementConstraint = (u, v, direction, gap=null) => {
	};

	const nodes = elements.filter(elt => elt.group === 'nodes');
	const selection = [];
	// Ordre chronologique des faits
	//
	
	const permuteVerticalAndHorizontal = () => {
		onChangeConstraints({
			...constraints,
			alignmentConstraint: {
				horizontal: alignmentConstraint?.vertical ?? [],
				vertical: alignmentConstraint?.horizontal ?? []
			}
		})
	}


	return (
		<div className="debug-bar">
			<h1>Barre de debuggage</h1>
			<hr />
			<button onClick={() => onChangeConstraints({})}>Réinitialiser les contraintes</button>
			<button onClick={() => onChangeLayout({})}>Réinitialiser les paramètres</button>
			<button onClick={() => permuteVerticalAndHorizontal()}>Permuter les contraintes d'alignement (horizontal-vertical)</button>
			<div>
				<input type="range" min="0.01" step="0.01" max="1" value={constantEdgeElasticity}
					onChange={evt => onChangeLayout({...layoutParameters, constantEdgeElasticity: +evt.target.value})}
				/>
				<label>Elasticité des arêtes ({constantEdgeElasticity})</label>
			</div>
			<div>
				<input type="range" min="1" step="10" max="10000" value={nodeRepulsion}
					onChange={evt => onChangeLayout({...layoutParameters, nodeRepulsion: +evt.target.value})}
				/>
				<label>Répulsion des noeuds ({nodeRepulsion})</label>
			</div>
			<div>
				<input type="range" min="1" step="10" max="10000" value={nodeSeparation}
					onChange={evt => onChangeLayout({...layoutParameters, nodeSeparation: +evt.target.value})}
				/>
				<label>Séparation des noeuds ({nodeSeparation})</label>
			</div>
			<div>
				<input type="range" min="1" step="10" max="5000" value={idealEdgeLength}
					onChange={evt => onChangeLayout({...layoutParameters, idealEdgeLength: +evt.target.value})}
				/>
				<label>Longueur d'arête idéale ({idealEdgeLength})</label>
			</div>
			{/*<h3>Contraintes de placement fixé</h3>
			<FixedPlacementNodeInput nodes={nodes} onAdd={addFixedPlacementConstraint} />*/}
			<h3>Contraintes d'alignement</h3>
			<div>Noeuds sélectionnés horizontalement <button onClick={addAlignmentConstraint(selection, 'horizontal')}>Ajouter</button></div>
			<div>Noeuds sélectionnés verticalement <button onClick={addAlignmentConstraint(selection, 'vertical')}>Ajouter</button></div>
			<h3>Contraintes de placement relatifs</h3>
			<RelativePlacementConstraintInput nodes={nodes} onAdd={addRelativePlacementConstraint} />
			<h3>Contraintes actuelles</h3>
			<ConstraintList constraints={constraints} nodes={nodes} />
		</div>
	);
}

function DemoSchema({databaseKey}: { databaseKey: string }) {
	const payload = toBackendPayload(db[databaseKey]);
	const summaryData = toGraph(payload);
	const initialLayoutConstraints = summaryData.layoutConstraints;
	const [layoutConstraints, setLayoutConstraints] = useState(initialLayoutConstraints);
	const [selection, setSelection] = useState([]);
	const [layoutParameters, setLayoutParameters] = useState({
		nodeRepulsion: 1000,
		nodeSeparation: 500,
		idealEdgeLength: 100,
		constantEdgeElasticity: 0.1
	});

	const getProperNeigh = (node: cytoscape.NodeDataDefinition) => {
		const [_, neigh] = getClosedNeighborWithDepth(node.id,
			summaryData.elements, 2);

		return Array.from(neigh);
	};

	const nonGhostIds = selection.flatMap(getProperNeigh);
	const ghostIds = selection.length > 0 ? summaryData.elements.filter(n => n.group === 'nodes' && !nonGhostIds.includes(n.data.id)).map(n => n.data.id) : [];

	const onSelect = useCallback(node => {
		const alreadyHere = selection.map(n => n.id).includes(node.id);

		if (!alreadyHere) {
			setSelection([...selection, node]);
		}
	});

	const onUnselect = useCallback(node => {
		setSelection(selection.filter(n => n.id !== node.id));
	});

	const onOutClick = () => {
		setSelection([]);
	}

	return (
	<div>
		<DebugBarLayout
			onChangeConstraints={setLayoutConstraints}
			onChangeLayout={setLayoutParameters}
			constraints={layoutConstraints}
			elements={summaryData.elements}
			layoutParameters={layoutParameters}
		/>
		<Schema
			elements={summaryData.elements}
			layoutConstraints={layoutConstraints}
			layoutParameters={layoutParameters}
			onSelect={onSelect}
			onUnselect={onUnselect}
			onOutClick={onOutClick}
			ghostIds={ghostIds}
			selectedIds={selection.map(n => n.id)}
		/>
	</div>
	);
}

export default DemoSchema;