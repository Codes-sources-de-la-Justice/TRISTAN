import React, { useCallback } from "react";

import { EntityCard, EntityHeader } from "./Entity";

import UserIcon from "remixicon-react/UserLineIcon";
import { Badge } from "@dataesr/react-dsfr";

import { Person, PersonRole, PersonWithGenericRole } from "../../static/model";
import {GridComponentProps} from "./Grid";

import styled from 'styled-components';

type PersonCardProps = GridComponentProps<PersonWithGenericRole>;

type PersonInfoProps = {
  person: Person;
  level?: number; // Information details level.
};

function deriveAgeFromDOB(dob: string): number {
  const [day, month, year] = dob.split("/");
  const msDelta: number = new Date().valueOf() - new Date(+year, +month, +day).valueOf();
  return Math.floor(msDelta / (1000 * 3600 * 24 * 365));
}

const prettyRoles = {
	[PersonRole.Victim]: "victime",
	[PersonRole.Indictee]: "mec",
	[PersonRole.Witness]: "témoin",
	[PersonRole.Other]: "inconnu"
};

const Warning = styled.i`
  color: orange;
`;

export function PersonInfo({ person, level = 1 }: PersonInfoProps) {
  const age = deriveAgeFromDOB(person.Naissance_Date);
  const showNatureEtatCivil = !!person.Nom_Marital;
  return (
    <>
      <h6>
        {person.Nom} {person.Prenom}
      </h6>
      {showNatureEtatCivil && (
        <p>
          <i>
            {person.Nature_Etat_Civil} {person.Nom_Marital}
          </i>
        </p>
      )}
      {level >= 1 && (
        <>
          <p>
            {age} ans (<i>{person.Naissance_Date}</i>){" "}
            {age <= 18 && <Warning>Mineur.e</Warning>}
          </p>
          <p>{person.Profession["#text"]}</p>
        </>
      )}
      {level >= 2 && (
        <>
          <p>
            {person.Nationalite["#text"]} ({person.Naissance_Lieu}{" "}
            {person.CP_Commune_Naissance})
          </p>
          <p>{person.Adresse}</p>
          <p>
            {person.Commune_Residence} {person.CP_Commune_Residence}
          </p>
        </>
      )}
    </>
  );
}

export function PersonCard({ entity, onClick, hidden, selected }: PersonCardProps) {
  const handleClick = useCallback(() => onClick(entity), [entity]);
  const rightIconColor =
    entity.role === PersonRole.Victim ? "yellow-tournesol" : undefined;
  // TODO: veuve/épou(x|se).
  // TODO: mineur.
  // TODO: representants.
  return (
    <EntityCard onClick={handleClick} hidden={hidden} selected={selected}>
      <EntityHeader
        left={<UserIcon />}
        right={
          <Badge
            text={prettyRoles[entity.role]}
            type="warning"
            colorFamily={rightIconColor}
            hasIcon={false}
          />
        }
      />
      <PersonInfo person={entity} />
    </EntityCard>
  );
}
