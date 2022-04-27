import React, { JSXElementConstructor } from "react";
import { Fact, PersonWithGenericRole } from "static/model";

// TODO: hiddenIds should be a Map
// TODO: onClick type confusion is a code smell.

export type Entity = PersonWithGenericRole | Fact;

export type GridComponentProps<T> = {
  entity: Entity & T;
  hidden: boolean;
  selected: boolean;
  onClick: (entity: Entity & T) => void;
};

type GridCardProps = {
  Component: JSXElementConstructor<GridComponentProps>;
  entities: Entity[];
  onClick: (entity: Entity) => void;
  hiddenIds: number[];
  selectedId: number;
};

export function GridCard({
  Component,
  entities,
  onClick,
  hiddenIds,
  selectedId,
}: GridCardProps) {
  return (
    <div className="grid-of-cards">
      {entities.map((entity) => (
        <Component
          hidden={hiddenIds.includes(entity.Global_Id)}
          key={entity.Global_Id}
          entity={entity}
          onClick={onClick}
          selected={entity.Global_Id === selectedId}
        />
      ))}
    </div>
  );
}
