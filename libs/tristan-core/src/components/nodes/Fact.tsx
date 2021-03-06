import React from 'react';
import { Badge } from '@dataesr/react-dsfr';
import {Fact} from '../../static/model';

export function FactNode({fact}: { fact: Fact }) {
		return (
			<>
				<div className="node-header">
					<p>{fact.Natinf} <i>{fact.Qualification}</i></p>
					<Badge className="flush-right" text="Faits" type="info" hasIcon={false} />
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

