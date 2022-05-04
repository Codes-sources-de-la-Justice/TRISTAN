// @ts-nocheck
import Cytoscape from 'cytoscape'

export function getEntity(id: string, elements: Cytoscape.ElementDefinition[]) {
	return elements.find(item => item.data.id === id);
}

export function showName(e?: Cytoscape.ElementDefinition | null): string {
	if (!e) return "entité non trouvée";

	if (e.data.type === 'person') {
		return `${e.data.Nom} ${e.data.Prenom[0]}.`;
	} else if (e.data.type === 'fact') {
		return `${e.data.Natinf}`;
	} else {
		return "entité inconnue";
	}
}

export function viewName(id: string, elements: Cytoscape.ElementDefinition[]): string {
	const e = getEntity(id, elements);

	return showName(e);
}

