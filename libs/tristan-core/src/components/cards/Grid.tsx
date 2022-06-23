import React, { JSXElementConstructor } from "react";
import { Fact, PersonWithGenericRole } from "../../static/model";
import styled from 'styled-components';

// TODO: hiddenIds should be a Map
// TODO: onClick type confusion is a code smell.

export type Entity = PersonWithGenericRole | Fact;

export type GridComponentProps<T extends Entity> = {
  entity: T;
  hidden: boolean;
  selected: boolean;
  onClick: (entity: T) => void;
};

type GridCardProps<T extends Entity> = {
  Component: JSXElementConstructor<GridComponentProps<T>>;
  entities: T[];
  onClick: (entity: T) => void;
  hiddenIds: number[];
  selectedId?: number | null;
};

const StyledGrid = styled.div`
  display: grid;
  grid-gap: 18px;
  grid-auto-rows: minmax(100px, auto);
  grid-template-columns: repeat(5, 1fr);
`;

export function GridCard<T extends Entity>({
  Component,
  entities,
  onClick,
  hiddenIds,
  selectedId,
}: GridCardProps<T>) {
  return (
    <StyledGrid>
      {entities.map((entity) => (
        <Component
          hidden={hiddenIds.includes(entity.Global_Id)}
          key={entity.Global_Id}
          entity={entity}
          onClick={onClick}
          selected={entity.Global_Id === selectedId}
        />
      ))}
    </StyledGrid>
  );
}
