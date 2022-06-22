// @ts-nocheck
import { ChangeEvent } from 'react'
import { Select } from '@dataesr/react-dsfr';
import Cytoscape from 'cytoscape'

export function NodeSelect({nodes, value, onSelect}: { nodes: Cytoscape.NodeDefinition[], value: any, onSelect: (selected: string) => void }) {
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


