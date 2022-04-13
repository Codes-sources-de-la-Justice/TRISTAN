import React, { JSXElementConstructor } from "react";
import { Fact, PersonWithGenericRole } from "static/model";
import { EntityCardProps } from "./Entity";

// TODO: hiddenIds should be a Map
// TODO: onClick type confusion is a code smell.

type Entity = PersonWithGenericRole | Fact;
type GridCardProps = {
  Component: JSXElementConstructor<
    EntityCardProps & { entity: Entity; onClick: (entity: Entity) => void }
  >;
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
