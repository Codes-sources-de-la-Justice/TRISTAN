import { multipartition } from "./utils";
import { getFactImplications, PersonRole } from "./model";
import { match } from "ts-pattern";

import type { Person, Fact, PersonWithGenericRole, RawAnalysis, BackendAnalysis, GraphAnalysis, LayoutConstraints } from "./model";
import type {
  ElementDefinition,
  NodeDataDefinition,
  EdgeDataDefinition,
} from "cytoscape";

export enum GenericNodeType {
  Fact = "fact",
  Person = "person"
}

export type GenericNodeData = NodeDataDefinition & { id: string; } & ({
  type: GenericNodeType.Fact;
  entity: Fact;
} | { type: GenericNodeType.Person, entity: PersonWithGenericRole });


function mapRoleFromPerson(person: Person): PersonRole[] {
  return getFactImplications(person).map((imp) => imp.Implication);
}

export function toBackendPayload(staticAnalysis: RawAnalysis): BackendAnalysis {
  const contents = staticAnalysis.Analyse_TRISTAN;
  const facts = contents.Faits;
  const persons = contents.Personnes.Physiques;
  const partitions = Object.fromEntries(
    Object.entries(
      multipartition(persons, mapRoleFromPerson, Object.values(PersonRole))
    ).map(([k, v]) => [
      k,
      v.map((item: Person) => ({ ...item, role: k } as PersonWithGenericRole)),
    ])
  );

  return {
    facts,
    victims: partitions['VIC'],
    indictees: partitions['MEC'],
    witnesses: partitions['TEM'],
    others: partitions['AUT'],
    general: contents.Infos_Generales || {},
  };
}

export function toGraph(backendPayload: BackendAnalysis): GraphAnalysis {
  const elements: ElementDefinition[] = [];
  const layoutConstraints: LayoutConstraints = {
    alignmentConstraint: { horizontal: [], vertical: [] },
    relativePlacementConstraint: [],
  };

  const globalIdsByFactId = Object.fromEntries(
    backendPayload.facts.map((fact) => [fact.Id_Fait, fact.Global_Id])
  );

  // TODO: O(1) check for already present items.

  function addNode(elements: ElementDefinition[], data: GenericNodeData) {
    elements.push({
      group: "nodes",
      data,
    });
  }

  function addEdge(
    elements: ElementDefinition[],
    { id, source, target }: EdgeDataDefinition
  ) {
    elements.push({
      group: "edges",
      data: {
        id: id ?? `edge-${source}-${target}`,
        source: source,
        target: target,
      },
    });
  }

  function hasElementId(elements: ElementDefinition[], nodeId: number) {
    return elements.some((element) => element?.data?.id === nodeId.toString());
  }

  function basicEntityNode(entity: PersonWithGenericRole): GenericNodeData {
    return {
      id: entity.Global_Id.toString(),
      type: GenericNodeType.Person,
      entity
    };
  }

  function registerPerson(
    elements: ElementDefinition[],
    person: PersonWithGenericRole,
    direction: "fact-person" | "person-fact"
  ) {
    addNode(elements, basicEntityNode(person));
    getFactImplications(person).forEach((fact) =>
      addEdge(
        elements,
        match(direction)
          .with("fact-person", () => ({
            source: person.Global_Id.toString(),
            target: globalIdsByFactId[fact.Id_Fait].toString(),
          }))
          .with("person-fact", () => ({
            source: globalIdsByFactId[fact.Id_Fait].toString(),
            target: person.Global_Id.toString(),
          }))
          .exhaustive()
      )
    );
  }

  function registerIndictee(
    elements: ElementDefinition[],
    indictee: PersonWithGenericRole
  ) {
    registerPerson(elements, indictee, "person-fact");
  }

  function registerVictim(
    elements: ElementDefinition[],
    victim: PersonWithGenericRole
  ) {
    registerPerson(elements, victim, "fact-person");
  }

  function registerFact(elements: ElementDefinition[], fact: Fact) {
    addNode(elements, { id: fact.Global_Id.toString(), type: GenericNodeType.Fact, entity: fact });
  }

  Object.values(backendPayload.facts).forEach((fact) =>
    registerFact(elements, fact)
  );
  Object.values(backendPayload.indictees).forEach((indictee) =>
    registerIndictee(elements, indictee)
  );
  Object.values(backendPayload.victims).forEach((victim) =>
    registerVictim(elements, victim)
  );

  const indicteesGroup: string[] = Object.values(backendPayload.indictees).map(
    (e) => e.Global_Id.toString()
  );
  const victimGroup: string[] = Object.values(backendPayload.victims).map((e) =>
    e.Global_Id.toString()
  );
  const factGroup: string[] = Object.values(backendPayload.facts).map((e) =>
    e.Global_Id.toString()
  );

  layoutConstraints.alignmentConstraint?.vertical?.push(indicteesGroup);
  layoutConstraints.alignmentConstraint?.vertical?.push(victimGroup);
  layoutConstraints.alignmentConstraint?.vertical?.push(factGroup);

  layoutConstraints.relativePlacementConstraint.push({
    left: indicteesGroup[0],
    right: victimGroup[0],
  });

  return { elements, layoutConstraints };
}

function _getOpenNeighbor(
  id: string,
  elements: ElementDefinition[]
): Set<string> {
  const edges = elements.filter((e) => e.group === "edges");
  const neigh: Set<string> = new Set();

  edges
    .filter((e) => e.data.source === id || e.data.target === id)
    .forEach((e) => {
      if (e.data.source === id) {
        neigh.add(e.data.target);
      } else {
        neigh.add(e.data.source);
      }
    });

  return neigh;
}

export function getOpenNeighbor(
  id: string,
  elements: ElementDefinition[]
): Array<string> {
  return Array.from(_getOpenNeighbor(id, elements));
}

function union<T>(A: Set<T>, B: Set<T>): Set<T> {
  const u = new Set(A);
  for (const elem of B) {
    u.add(elem);
  }
  return u;
}

function flattenSet<T>(A: ArrayLike<Set<T>>): Set<T> {
  return Array.from(A).reduce((prev, cur) => union(prev, cur), new Set());
}

/** Calcule le voisinage d'ordre n fermé d'un noeud
 * avec un filtrage à profondeur arbitraire pour tout k ≤ n.
 * Par défaut, n = 1.
 *
 * Retourne la paire (profondeur → ensemble de noeuds, voisinage fermé d'ordre n filtré).
 * */

export function getClosedNeighborWithDepth(
  id: string,
  elements: ElementDefinition[],
  depth: number = 1,
  filterAtDepth: (depth: number, neighbor: any) => boolean = () => true
): [Array<Set<string>>, Set<string>] {
  let seen = new Set();
  const depths: Array<Set<string>> = Array.from(Array(depth), () => new Set());

  depths[0] = new Set([id]);
  for (let iDepth = 1; iDepth < depth; iDepth++) {
    depths[iDepth] = flattenSet(
      Array.from(depths[iDepth - 1])
        .filter((neigh) => !seen.has(neigh) && filterAtDepth(iDepth, neigh))
        .map((neigh) => _getOpenNeighbor(neigh, elements))
    );
    seen = union(seen, depths[iDepth - 1]);
  }

  return [depths, flattenSet(Array.from(depths))];
}

export function getClosedNeighbor(id: string, elements: ElementDefinition[]) {
  return [id, ...getOpenNeighbor(id, elements)];
}
