import dagre from "dagre";

import {
  faEdit,
  faClock,
  faMap,
  faBookOpen,
	faCar,
	faPhone
} from "@fortawesome/free-solid-svg-icons";

const parameters = {
  icon: {
    width: 144,
    height: 100,
  },
  date: {
    icon: faClock, // clock
    width: 144,
    height: 75,
    type: "icon",
  },
  place: {
    icon: faMap, // map
    width: 144,
    height: 55,
    type: "icon",
  },
  pv_audition: {
    icon: faBookOpen, // book_open
    width: 64,
    height: 80,
    type: "icon",
		label: "Procès verbal d'audition"
  },
  person: {
    width: 144,
    height: 100,
    type: "icon",
  },
	vehicle: {
		width: 64,
		height: 64,
		type: "icon",
		icon: faCar
	},
	phone_number: {
		width: 100,
		height: 100,
		type: "icon",
		icon: faPhone
	},
	pv_verbal_vol_voiture: {
		icon: faBookOpen,
		width: 64,
		height: 80,
		label: "Procès verbal de vol de voiture",
		type: "icon"
	},
	bordereau_envoi_judiciaire: {
		icon: faBookOpen,
		width: 70,
		height: 70,
		label: "Bordereau d'envoi judiciaire",
		type: "icon"
	}
};

function expandNodeValue(val) {
	if (!parameters.hasOwnProperty(val.type)) {
		console.warn(`No base parameters for type \`${val.type}\``);
	}
	const nodeValue = {...val, ...parameters[val.type]};
	if (val.type === "icon") {
		nodeValue.width = 64 + (!!nodeValue.label ? 10 : 0);
		nodeValue.height = 64 + (!!nodeValue.label ? 10 : 0);
	}

	return nodeValue
}

export function fromRawTimeline(timeline) {
	const g = new dagre.graphlib.Graph();

	g.setGraph({});
	g.setDefaultEdgeLabel(() => ({}));


	Object.keys(timeline.nodes).forEach(index => {
		const n = timeline.nodes[index]
		g.setNode(index, expandNodeValue({
			label: `${n.Personne_Nom} ${n.Personne_Prenom}, rôle: ${n.Personne_Implication}`,
			type: "person"
		}));
	});

	return g;
}
