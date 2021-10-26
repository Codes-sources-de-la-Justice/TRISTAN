import Logos from "./logos";

import React, { useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

import Graph from "./components/Graph";
import dagre from "dagre";

import {
  faEdit,
  faClock,
  faMap,
  faBookOpen,
	faCar,
	faPhone
} from "@fortawesome/free-solid-svg-icons";

function Logo({ logo, ...props }) {
  const [image] = useImage(Logos[logo]);
  return <KonvaImage image={image} width={100} height={100} {...props} />;
}

const g = new dagre.graphlib.Graph();

g.setGraph({});
g.setDefaultEdgeLabel(() => ({}));

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
function setNode(key, value) {
  return g.setNode(key, expandNodeValue(value));
}

setNode("date_evt", { label: "27/10/2020 à 10 h 47", type: "date" });
setNode("nature_evt", { label: "Vol", type: "icon", icon: faEdit });
setNode("where_evt", { label: "Clamart", type: "place" });
setNode("nature_where_evt", {
  label: "Commerce de vins et spiritueux",
  type: "place",
});
setNode("pv_audition_1", { type: "pv_audition" });
setNode("date_pv_audition_1", {
  label: "mardi 27 octobre 2020 10 heures 45 minutes",
  type: "date",
});
setNode("pv_audition_2", { type: "pv_audition" });
setNode("date_pv_audition_2", {
  label: "mardi 27 octobre 2020 16 heures 00 minutes",
  type: "date",
});
setNode("victim_1", {
  type: "person",
  label: "VICTIME Louise",
  image: "something",
});
setNode("tag_1", { type: "icon", label: "Victime" });
setNode("mis_en_cause_1", {
	type: "person",
	label: "LAUTEUR Henry",
	image: "something"
});
setNode("tag_2", { type: "icon", label: "Mis(e) en cause" });
setNode("date_bordereau_envoi_judiciaire_1", { label: "mardi 27 octobre 2020 16 heures 09 minutes", type: "date" });
setNode("bordereau_envoi_judiciaire_1", { type: "bordereau_envoi_judiciaire" });
setNode("date_pv_vol_voiture_1", { type: "date", label: "07/11/2020 à 09:30" });
setNode("pv_verbal_vol_voiture_1", { type: "pv_verbal_vol_voiture" });
setNode("nature_evt_2", { type: "icon", icon: faEdit, label: "Tentative-vol à la roulotte" });
setNode("nature_where_evt_2", { type: "place", label: "Crapeaumesnil" });
setNode("voiture_1", { type: "vehicle", label: "AQ-197-RT" });
setNode("victim_2", {
	type: "person",
	label: "JUR Paul",
	image: "something"
});
setNode("tag_3", { type: "icon", label: "Victime" });
setNode("phone_number_1", { type: "phone_number", label: "03.22.74.85.82" });

g.setEdge("date_evt", "nature_evt");
g.setEdge("where_evt", "nature_where_evt");
g.setEdge("date_pv_audition_1", "pv_audition_1");
g.setEdge("pv_audition_1", "mis_en_cause_1");
g.setEdge("mis_en_cause_1", "tag_2");
g.setEdge("nature_evt", "pv_audition_2");
g.setEdge("date_pv_audition_2", "pv_audition_2");
g.setEdge("pv_audition_2", "victim_1");
g.setEdge("victim_1", "tag_1");
g.setEdge("date_bordereau_envoi_judiciaire_1", "bordereau_envoi_judiciaire_1");
g.setEdge("date_pv_vol_voiture_1", "pv_verbal_vol_voiture_1");
g.setEdge("nature_evt_2", "pv_verbal_vol_voiture_1");
g.setEdge("pv_verbal_vol_voiture_1", "voiture_1");
g.setEdge("nature_evt_2", "nature_where_evt_2");
//g.setEdge("bordereau_envoi_judiciaire_1", "voiture_1");
g.setEdge("victim_2", "phone_number_1");
g.setEdge("victim_2", "tag_3");

//g.setEdge("phone_number_1", "mis_en_cause_1", { label: "Echange téléphonique", width: 100, height: 20, lablepos: "c" });
g.setEdge("nature_evt", "where_evt");

function Schema() {
	const [stage, setStage] = useState({
		scale: 1,
		x: 0,
		y: 0
	})
	// TODO: generalize zoomable & pannable stages.
	// TODO: handle better values for scaleBy.
	// TODO: handle onTouchEnd events.
	const handleWheel = e => {
		e.evt.preventDefault();

		const scaleBy = 1.15
		const stage = e.target.getStage()
		const oldScale = stage.scaleX()

		const mousePointTo = {
			x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
			y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
		};

		const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy

		setStage({
			scale: newScale,
			x: (-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale),
			y: (-(mousePointTo.y - stage.getPointerPosition().y / newScale ) * newScale)
		});
	}

  return (
    <Stage
			draggable
			onWheel={handleWheel}
      width={window.innerWidth}
      height={window.innerHeight}
			scaleX={stage.scale}
			scaleY={stage.scale}
			x={stage.x}
			y={stage.y}
    >
      <Layer>
        <Logo logo="GN" y={150} width={150} />
        <Logo logo="Douane" y={270} width={116} />
        <Logo logo="MJ" y={400} width={123} />
        <Graph.Graph graph={g} x={150} y={100} />
      </Layer>
    </Stage>
  );
}
export default Schema;
