import React, { ReactNode, useCallback } from "react";

import MapPinIcon from "remixicon-react/MapPinLineIcon";
import TimeIcon from "remixicon-react/TimeLineIcon";

import { EntityCard, EntityCardProps, EntityHeader } from "./Entity";
import { Badge } from "@dataesr/react-dsfr";
import { Fact, LawArticle } from "static/model";

type FactCardProps = EntityCardProps & {
  entity: Fact;
  onClick: (entity: Fact) => void;
};

type FactInfoProps = {
  fact: Fact;
  level?: number;
};

type ListOfLinksProps = {
  list: LawArticle[];
  empty: ReactNode;
};

function ListOfLinks({ list, empty = null }: ListOfLinksProps) {
  if (!list || !list.map) return empty;
  return (
    <>
      {list
        .map(({ Lien, Valeur }) => <a href={Lien}>{Valeur}</a>)
        .reduce((prev, cur) => [prev, ", ", cur])}
    </>
  );
}

export function FactInfo({ fact, level = 1 }: FactInfoProps) {
  return (
    <>
      <h6>{fact.Libelle}</h6>
      {level >= 1 && (
        <>
          {fact.Libelle_Magistrat.Circonstances && (
            <p>{fact.Libelle_Magistrat.Circonstances}</p>
          )}
          <p>
            <TimeIcon /> {fact.Periode_Affaire_Debut["#text"]} &gt;{" "}
            {fact.Periode_Affaire_Fin["#text"]}
          </p>
          <p>
            <MapPinIcon /> {fact.Nature_Lieu["#text"]}
          </p>
        </>
      )}
      {level >= 2 && (
        <>
          <p>
            Pour s'être trouvé à {fact.Libelle_Magistrat.Lieux.Lieu},{" "}
            {fact.Libelle_Magistrat.Explication}{" "}
          </p>
          <p>
            Faits prévus par:{" "}
            <ListOfLinks
              list={fact.Libelle_Magistrat.Articles_Prevus.Article}
              empty={"aucun spécifié"}
            />{" "}
          </p>
          <p>
            Faits réprimés par:{" "}
            <ListOfLinks
              list={fact.Libelle_Magistrat.Articles_Reprimes.Article}
              empty={"aucun spécifié"}
            />{" "}
          </p>
        </>
      )}
    </>
  );
}

export function FactCard({ entity, onClick, hidden, selected }: FactCardProps) {
  const handleClick = useCallback(() => onClick(entity), [entity]);
  return (
    <EntityCard onClick={handleClick} hidden={hidden} selected={selected}>
      <EntityHeader
        left={
          <p>
            {entity.Natinf} <i>{entity.Qualification}</i>
          </p>
        }
        right={<Badge text="Faits" type="info" icon={false} />}
      />
      <FactInfo fact={entity} />
    </EntityCard>
  );
}
