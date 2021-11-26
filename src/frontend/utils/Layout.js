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
		nodeValue.width = 64 + (!!nodeValue.label.length ? 1.7 * nodeValue.label.length : 0);
		nodeValue.height = 64 + (!!nodeValue.label.length ? 0.2 * nodeValue.label.length : 0);
	}

	return nodeValue
}

export function fromRawTimeline(timeline) {
	const g = new dagre.graphlib.Graph();

	g.setGraph({});
	g.setDefaultEdgeLabel(() => ({}));



	Object.keys(timeline.facts).forEach(index => {
		const fact = timeline.facts[index];

		g.setNode(`${index}-startdate`, expandNodeValue({
			label: fact.start_utc,
			type: "date"
		}));

		if (fact.end_utc) {
			g.setNode(`${index}-enddate`, expandNodeValue({
				label: fact.end_utc,
				type: "date"
			}));
			g.setEdge(index, `${index}-enddate`);
		}

		g.setNode(index, expandNodeValue({
			label: fact.libelle ? `${fact.libelle} - ${fact.natinf}` : `${fact.natinf}`,
			type: "icon",
			icon: faEdit
		}));

		g.setEdge(`${index}-startdate`, index);
	});

	Object.keys(timeline.nodes).forEach(index => {
		const n = timeline.nodes[index]
		g.setNode(index, expandNodeValue({
			label: `${n.Personne_Nom} ${n.Personne_Prenom}, rôle: ${n.Personne_Implication}`,
			type: "person"
		}));

		if (n.Personne_Telephone) {
			g.setNode(`${index}-phone`, expandNodeValue({
				label: n.Personne_Telephone,
				type: "phone_number"
			}));
			g.setEdge(index, `${index}-phone`);
		}


		n.fact_ids.forEach(f_id => {
			g.setEdge(f_id, index);
		});
	});


	return g;
}
