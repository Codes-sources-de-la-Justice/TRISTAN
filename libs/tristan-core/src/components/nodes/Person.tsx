import React from "react";

import { Badge } from "@dataesr/react-dsfr";
import UserIcon from "remixicon-react/UserLineIcon";

import { PersonRole } from "../../static/model";

type Person = {
  role: PersonRole;
  Nom: string;
  Prenom: string;
};

type Props = {
  person: Person;
};

export function PersonNode({ person }: Props) {
  return (
    <>
      <div className="node-header">
        <UserIcon />
        <Badge
          className="flush-right"
          text={person.role}
          type="warning"
          colorFamily={
            person.role === PersonRole.Victim ? "yellow-tournesol" : undefined
          }
          hasIcon={false}
        />
      </div>
      <h3>
        {person.Nom} {person.Prenom}
      </h3>
      {/*<p>{age} ans</p>
				<p>{person.Personne_Profession["#text"]}</p>
				<p>{person.Personne_Commune_Residence} {person.Personne_CP_Commune_Residence}</p>*/}
    </>
  );
}
