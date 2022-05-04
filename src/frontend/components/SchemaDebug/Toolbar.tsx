// @ts-nocheck
import {LayoutConstraints} from '../../static/model';
import Cytoscape from 'cytoscape'

import { ConstraintList } from './ConstraintList'
import { RelativePlacementConstraintInput } from './ConstraintsInput'

export type LayoutParameters = {
	nodeRepulsion: number;
	nodeSeparation: number;
	idealEdgeLength: number;
	constantEdgeElasticity: number;
};

type DebugBarLayoutProps = {
	onChangeConstraints: (constraints: LayoutConstraints) => void;
	onChangeLayout: (layout: LayoutParameters) => void;
	constraints: LayoutConstraints;
	elements: Cytoscape.ElementDefinition[];
	layoutParameters: any;
};

export function DebugBarLayout({onChangeConstraints, onChangeLayout, constraints, elements, layoutParameters}: DebugBarLayoutProps) {
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

