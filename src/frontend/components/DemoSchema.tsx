import React, { useState, useCallback, useEffect } from 'react';
import Schema from '../containers/Schema';
import { toBackendPayload, toGraph, getClosedNeighborWithDepth } from '../static';
import { db } from '../static/db';
import './DemoSchema.css';

import { DebugBarLayout, LayoutParameters } from './SchemaDebug/Toolbar'

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

function DemoSchema({databaseKey}: { databaseKey: string }) {
	const payload = toBackendPayload(db[databaseKey]);
	const summaryData = toGraph(payload);
	const initialLayoutConstraints = summaryData.layoutConstraints;
	const [layoutConstraints, setLayoutConstraints] = useState(initialLayoutConstraints);
	const [selection, setSelection] = useState([]);
	const [layoutParameters, setLayoutParameters] = useState<LayoutParameters>({
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
	const ghostIds = selection.length > 0 
	? summaryData.elements
			.filter(n => n.group === 'nodes' && n.data.id !== undefined && !nonGhostIds.includes(n.data.id))
			.map(n => (n.data.id as string)) 
	: [];

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
