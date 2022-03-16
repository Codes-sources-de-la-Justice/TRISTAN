import React from 'react';
import Summary from '../containers/Summary.jsx';
import { db, toBackendPayload, toGraph } from '../static';

function DemoSummary({databaseKey}) {
	const payload = toBackendPayload(db[databaseKey]);
	const { elements } = toGraph(payload);
	const { facts, victims, indictees, general } = payload;
	// TODO: add witnesses, others.
	return (
		<Summary
			elements={elements}
			summary={{
				entities: {
					victims,
					indictees
				},
				facts: facts,
				general: general
			}}
		/>
	);
}

export default DemoSummary;
