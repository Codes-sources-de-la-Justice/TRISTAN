import Cytoscape from 'cytoscape'
import type { LayoutConstraints } from '../../static/model';

type ConstraintListProps = {
	nodes: Cytoscape.NodeDefinition[];
	constraints: LayoutConstraints;
};

export function ConstraintList({constraints: { alignmentConstraint, relativePlacementConstraint }, nodes}: ConstraintListProps) {
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

