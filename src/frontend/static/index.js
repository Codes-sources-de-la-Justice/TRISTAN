function baseName(x) {
	const parts = x.split('/');
	return parts[parts.length - 1];
}

const tgcmFiles = import.meta.globEager('./tgcm/*.json');
function processTgcmEntry([filename, json]) {
	const baseFileName = baseName(filename);
	return [
		baseFileName.substr(0, baseFileName.length - 5),
		json
	];
}
export const db = Object.fromEntries(Object.entries(tgcmFiles).map(processTgcmEntry));

function liftArray(e) {
	if (Array.isArray(e)) {
		return e;
	} else {
		return [e];
	}
}

function getImplications(entity) {
	const { Implications } = entity;
	let imps = [];
	if (Implications.Implications_Faits?.Implication_Fait) {
		imps = [...imps, ...liftArray(Implications.Implications_Faits.Implication_Fait)];
	} else if (Implications.Implications_Faits) {
		imps = [...imps, ...liftArray(Implications.Implications_Faits)];
	}
	return imps;
}

function getFactImplications(entity) {
	return getImplications(entity).filter(imp => !!imp.Id_Fait);
}

function multipartition(set, keyFunc, expected) {
	const partitions = {};
	expected.forEach(key => {
		partitions[key] = new Set();
	});

	set.forEach(item => {
		if (Array.from(keyFunc(item)).some(key => !expected.includes(key))) {
			throw new Error(`Unexpected one of the following key \`${keyFunc(item)}\` during multi-partitioning`);
		}
		Array.from(keyFunc(item)).forEach(key => {
			partitions[key].add(item);
		});
	});

	// Convert all Array-like objects to proper Array.
	return Object.fromEntries(
		Object.entries(partitions).map(([k, v]) => ([k, Array.from(v)]))
	);
}

export const ROLES = {
	VICTIM: 'VIC',
	INDICTEE: 'MEC',
	WITNESS: 'TEM',
	OTHER: 'AUT'
};

function mapRoleFromPerson(person) {
	return getImplications(person).map(imp => imp.Implication);
}

export function toBackendPayload(staticAnalysis) {
	const contents = staticAnalysis.Analyse_TRISTAN;
	const facts = contents.Faits.Fait;
	const persons = contents.Personnes.Personnes_Physiques.Personne;
	const partitions = Object.fromEntries(
		Object.entries(multipartition(persons, mapRoleFromPerson, Object.values(ROLES))).map(([k, v]) => ([k, v.map(item => ({...item, role: k}))])));

	return { facts, victims: partitions.VIC, indictees: partitions.MEC, witnesses: partitions.TEM, others: partitions.AUT, general: contents.Infos_Generales || {} };
}

export function toGraph(backendPayload) {
	const elements = [ ];
	const layoutConstraints = {
		alignmentConstraint: { horizontal: [ ], vertical: [ ] },
		relativePlacementConstraint: [ ]
	};

	const globalIdsByFactId = Object.fromEntries(
		backendPayload.facts.map(fact => [fact.Id_Fait, fact.Global_Id])
	);

	function addNode(elements, nodeData) {
		elements.push({
			group: "nodes",
			data: {
				...nodeData,
				id: nodeData.id.toString()
			}
		});
	}

	function addEdge(elements, { id, source, target }) {
		elements.push({
			group: "edges",
			data: {
				id: id ? id.toString() : `edge-${source}-${target}`,
				source: source.toString(),
				target: target.toString()
			}
		});
	}

	function hasElementId(elements, nodeId) {
		return elements.some(element => element?.data?.id === nodeId.toString())
	}


	function basicEntityNode(entity) {
		return {
			id: entity.Global_Id,
			type: 'person',
			...entity
		};
	}

	function registerIndictee(elements, indictee) {
		addNode(elements, basicEntityNode(indictee));
		getFactImplications(indictee)
			.forEach(fact => addEdge(elements, { source: indictee.Global_Id, target: globalIdsByFactId[fact.Id_Fait] }));
	}

	function registerVictim(elements, victim) {
		addNode(elements, basicEntityNode(victim));
		getFactImplications(victim)
			.forEach(fact => addEdge(elements, { source: globalIdsByFactId[fact.Id_Fait], target: victim.Global_Id }));
	}

	function registerFact(elements, fact) {
		addNode(elements, { id: fact.Global_Id, type: 'fact', ...fact});
	}

	Object.values(backendPayload.facts).forEach(fact => registerFact(elements, fact));
	Object.values(backendPayload.indictees).forEach(indictee => registerIndictee(elements, indictee));
	Object.values(backendPayload.victims).forEach(victim => registerVictim(elements, victim));

	const indicteesGroup = Object.values(backendPayload.indictees).map(e => e.Global_Id);
	const victimGroup = Object.values(backendPayload.victims).map(e => e.Global_Id);
	const factGroup = Object.values(backendPayload.facts).map(e => e.Global_Id)

	layoutConstraints.alignmentConstraint.vertical.push(indicteesGroup);
	layoutConstraints.alignmentConstraint.vertical.push(victimGroup);
	layoutConstraints.alignmentConstraint.vertical.push(factGroup);

	layoutConstraints.relativePlacementConstraint.push({left: indicteesGroup[0], right: victimGroup[0]});

	return { elements, layoutConstraints };

}

function _getOpenNeighbor(id, elements) {
	const edges = elements.filter(e => e.group === 'edges');
	const neigh = new Set();

	edges.filter(e => e.data.source === id || e.data.target === id).forEach(e => {
		if (e.data.source === id) {
			neigh.add(e.data.target)
		} else {
			neigh.add(e.data.source);
		}
	});

	return neigh;
}

export function getOpenNeighbor(id, elements) {
	return Array.from(_getOpenNeighbor(id, elements));
}

function union(A, B) {
	const u = new Set(A);
	for (const elem of B) {
		u.add(elem);
	}
	return u;
}

function flattenSet(A) {
	return Array.from(A).reduce((prev, cur) => union(prev, cur), new Set());
}

export function getClosedNeighborWithDepth(id, elements, depth, filterAtDepth) {
	if (!depth) {
		depth = 1;
	}
	let seen = new Set();
	const depths = Array.from(Array(depth), () => []);

	if (!filterAtDepth) {
		filterAtDepth = () => true;
	}

	depths[0] = new Set([id]);
	for (let iDepth = 1 ; iDepth < depth ; iDepth++) {
		depths[iDepth] = flattenSet(Array.from(depths[iDepth - 1]).filter(neigh => !seen.has(neigh) && filterAtDepth(iDepth, neigh)).map(neigh => _getOpenNeighbor(neigh, elements)));
		seen = union(seen, depths[iDepth - 1]);
	}

	console.log(depths);

	return [depths, flattenSet(Object.values(depths))];
}

export function getClosedNeighbor(id, elements) {
	return [id, ...getOpenNeighbor(id, elements)]
}
