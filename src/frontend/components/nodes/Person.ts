import React from 'react';

function PersonNode() {
  return (
			<>
				<div className="node-header">
					<UserIcon />
					<Badge className="flush-right" text={person.role} type="warning" colorFamily={person.role === "VICTIME" ? "yellow-tournesol" : undefined} icon={false} />
				</div>
				<h3>{person.Nom} {person.Prenom}</h3>
				{/*<p>{age} ans</p>
				<p>{person.Personne_Profession["#text"]}</p>
				<p>{person.Personne_Commune_Residence} {person.Personne_CP_Commune_Residence}</p>*/}
			</>
    );
}
