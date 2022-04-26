import React, { useState, useCallback } from "react";

import { getClosedNeighborWithDepth } from "../static";
import Joyride from "react-joyride";

import { FactInfo } from '../components/cards/Fact';
import { PersonInfo } from '../components/cards/Person';
import { FactCard, GridCard, PersonCard } from "../components/cards";

import "./Summary.css";
import { Fact, GeneralInformation, PersonEntityPartition } from "static/model";
import { ElementDefinition } from "cytoscape";

type SummaryProps = {
  summary: {
    entities: PersonEntityPartition;
    facts: Fact[];
    general: GeneralInformation;
  };
  elements: ElementDefinition[];
};

function Sidebar({ open, entity, onClose }) {
  if (!open) return null;

  const entityType = entity.Natinf != null ? "fact" : "person";
  const entityInfo =
    entityType === "fact" ? (
      <FactInfo fact={entity} level={2} />
    ) : (
      <PersonInfo person={entity} level={2} />
    );

  return (
    <div className="sidebar">
      <button onClick={onClose}>Fermer</button>
      {entityInfo}
    </div>
  );
}

function GeneralInfo({
  general: { Jonction, Depaysement, Scelles },
  entities: { victims, indictees },
  facts,
}) {
  // S'il existe un mineur, le montrer
  // Calculer atteintes aux biens -> NATAF?
  return (
    <>
      {Jonction && <Tag>Jonction</Tag>}
      {Depaysement && <Tag>Dépaysement</Tag>}
      {Scelles && <Tag>Présence de scellés</Tag>}
    </>
  );
}


function Summary({
  summary: { entities, facts, general },
  elements,
}: SummaryProps) {
  const [selectedEntity, selectEntity] = useState(null);
  const handleClose = useCallback(() => selectEntity(null));

  const [preferredIds, setPreferredIds] = useState([]);
  const hiddenIds =
    preferredIds.length > 0
      ? [...Object.values(entities), facts].flatMap((a) =>
          a
            .filter((n) => !preferredIds.includes(n.Global_Id))
            .map((n) => n.Global_Id)
        )
      : [];

  const handleEntityClick = (entity) => {
    selectEntity(entity);

    if (Object.is(selectedEntity, entity) && preferredIds.length > 0) {
      setPreferredIds([]);
    } else {
      const [_, neighbors] = getClosedNeighborWithDepth(
        entity.Global_Id,
        elements,
        3
      );
      setPreferredIds(Array.from(neighbors));
    }
  };

  const steps = [
    {
      target: ".summary",
      content: "Bienvenue dans votre visualisation de synthèse",
      placementBeacon: "top",
    },
    {
      target: ".entity-card",
      content: "Vous trouverez vos entités ici !",
      placementBeacon: "top",
    },
  ];

  const selectedId = preferredIds.length > 0 ? selectedEntity?.Global_Id : null;

  return (
    <div className="summary-container">
      <Joyride
        continuous
        showSkipButton
        showProgress
        debug
        locale={{
          back: "Retour",
          close: "Fermer",
          last: "Fin",
          next: "Suivant",
          open: "Ouvrir la modale",
          skip: "Passer",
        }}
        steps={steps}
      />
      <div className="summary">
        <div className="summary-header">
          <h1>Procédure</h1>
          <div className="summary-header__tags">
            <GeneralInfo entities={entities} general={general} />
          </div>
        </div>
        <div className="summary-body">
          <GridCard
            Component={FactCard}
            entities={facts}
            onClick={handleEntityClick}
            hiddenIds={hiddenIds}
            selectedId={selectedId}
          />
          <hr />
          {Object.values(entities).map((subentities, index) => (
            <React.Fragment key={index}>
              <GridCard
                Component={PersonCard}
                entities={subentities}
                onClick={handleEntityClick}
                hiddenIds={hiddenIds}
                selectedId={selectedId}
              />
              <hr />
            </React.Fragment>
          ))}
        </div>
      </div>
      <Sidebar
        open={selectedEntity != null}
        entity={selectedEntity}
        onClose={handleClose}
      />
    </div>
  );
}

export default Summary;
