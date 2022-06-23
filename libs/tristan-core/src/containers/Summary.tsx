import React, { useState, MouseEventHandler } from "react";

// TODO: Refactor entity type definition somewhere else.
import type { Entity } from "../components/cards/Grid";
import { getClosedNeighborWithDepth } from "../static";
import Joyride from "react-joyride";

import { Tag } from "@dataesr/react-dsfr";

import { FactInfo } from "../components/cards/Fact";
import { PersonInfo } from "../components/cards/Person";
import { FactCard, GridCard, PersonCard } from "../components/cards";

import { Fact, GeneralInformation, PersonEntityPartition, PersonWithGenericRole } from "../static/model";
import { ElementDefinition } from "cytoscape";

import styled from 'styled-components';

type SummaryProps = {
  summary: {
    entities: PersonEntityPartition;
    facts: Fact[];
    general: GeneralInformation;
  };
  elements: ElementDefinition[];
};

type SidebarProps = {
  open: boolean;
  entity: Entity | null;
  onClose: MouseEventHandler<HTMLButtonElement>;
};

function isFact(entity: Entity): entity is Fact {
  return (entity as Fact).Natinf !== undefined;
}

const StyledSidebar = styled.div`
  top: 0;
  border-left: 1px solid #000000;
  padding: 10px 15px;
  margin: 0 10px;
  max-width: 300px;
  position: sticky;
  align-self: flex-start;
`;

function Sidebar({ open, entity, onClose }: SidebarProps) {
  if (!open) return null;
  if (!entity) return null;

  const entityInfo = isFact(entity) ? (
    <FactInfo fact={entity} level={2} />
  ) : (
    <PersonInfo person={entity} level={2} />
  );

  return (
    <StyledSidebar>
      <button onClick={onClose}>Fermer</button>
      {entityInfo}
    </StyledSidebar>
  );
}

type GeneralInfoProps = {
  general: GeneralInformation;
  entities: PersonEntityPartition;
  facts: Fact[];
};

function GeneralInfo({
  general: { Jonction, Depaysement, Scelles },
  entities: { victims, indictees },
  facts,
}: GeneralInfoProps) {
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

const StyledSummaryContainer = styled.section`
  display: flex;
`;

const StyledSummary = styled.section`
  margin-left: 90px;
  margin-right: 77px;

  p {
    font-size: 0.8em;
  }

  h6 {
    font-size: 1em;
  }

  hr {
    margin: 23px 0;
  }
`;

const StyledHeader = styled.header`
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 20px 5px;

  h1 {
    margin: inherit;
  }
`;

const StyledHeaderTags = styled.div`
  margin-left: auto;

  p {
    margin: 5px;
  }
`;

const StyledBody = styled.div``;

function Summary({
  summary: { entities, facts, general },
  elements,
}: SummaryProps) {
  const [selectedEntity, selectEntity] = useState<Entity | null>(null);
  const handleClose = () => selectEntity(null);

  const [preferredIds, setPreferredIds] = useState<string[]>([]);
  const hiddenIds =
    preferredIds.length > 0
      ? ([...Object.values(entities), facts] as Entity[][]).flatMap((a) =>
          a
            .filter((n) => !preferredIds.includes(n.Global_Id.toString()))
            .map((n) => n.Global_Id)
        )
      : [];

  const handleEntityClick = (entity: Entity) => {
    selectEntity(entity);

    if (Object.is(selectedEntity, entity) && preferredIds.length > 0) {
      setPreferredIds([]);
    } else {
      const [_, neighbors] = getClosedNeighborWithDepth(
        entity.Global_Id.toString(),
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
      placementBeacon: "top" as const,
    },
    {
      target: ".entity-card",
      content: "Vous trouverez vos entités ici !",
      placementBeacon: "top" as const,
    },
  ];

  const selectedId = preferredIds.length > 0 ? selectedEntity?.Global_Id : null;

  // TODO: tutorial

  return (
    <StyledSummaryContainer>
      <StyledSummary>
        <StyledHeader>
          <h1>Procédure</h1>
          <StyledHeaderTags>
            <GeneralInfo entities={entities} general={general} facts={facts} />
          </StyledHeaderTags>
        </StyledHeader>
        <StyledBody>
          <GridCard<Fact>
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
      </StyledBody>
      </StyledSummary>
      <Sidebar
        open={selectedEntity != null}
        entity={selectedEntity}
        onClose={handleClose}
      />
    </StyledSummaryContainer>
  );
}

export default Summary;
