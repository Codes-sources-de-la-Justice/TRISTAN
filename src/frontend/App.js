import "./App.css";
import Logos from "./logos";

import React from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

import Graph from "./components/Graph";
import dagre from "dagre";

import {
  faEdit,
  faClock,
  faMap,
  faBookOpen,
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
    height: 100,
    type: "icon",
  },
  place: {
    icon: faMap, // map
    width: 144,
    height: 100,
    type: "icon",
  },
  pv_audition: {
    icon: faBookOpen, // book_open
    width: 200,
    height: 200,
    type: "icon",
  },
  person: {
    width: 200,
    height: 200,
    type: "icon",
  },
};

function expandNodeValue(val) {
  return { ...val, ...parameters[val.type] };
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

g.setEdge("date_evt", "nature_evt");
g.setEdge("nature_evt", "where_evt");
g.setEdge("where_evt", "nature_where_evt");
g.setEdge("date_pv_audition_1", "pv_audition_1");
g.setEdge("nature_evt", "pv_audition_2");
g.setEdge("date_pv_audition_2", "pv_audition_2");
g.setEdge("pv_audition_2", "victim_1");
g.setEdge("victim_1", "tag_1");

/*// DEMO rapide
// Add nodes to the graph. The first argument is the node id. The second is
// metadata about the node. In this case we're going to add labels to each of
// our nodes.
g.setNode("kspacey",    { label: "Kevin Spacey",  width: 144, height: 100 });
g.setNode("swilliams",  { label: "Saul Williams", width: 160, height: 100 });
g.setNode("bpitt",      { label: "Brad Pitt",     width: 108, height: 100 });
g.setNode("hford",      { label: "Harrison Ford", width: 168, height: 100 });
g.setNode("lwilson",    { label: "Luke Wilson",   width: 144, height: 100 });
g.setNode("kbacon",     { label: "Kevin Bacon",   width: 121, height: 100 });

// Add edges to the graph.
g.setEdge("kspacey",   "swilliams");
g.setEdge("swilliams", "kbacon");
g.setEdge("bpitt",     "kbacon");
g.setEdge("hford",     "lwilson");
g.setEdge("lwilson",   "kbacon");
//g.setEdge("kspacey", "hford");
//*/

function App() {
  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={0.8}
      scaleY={0.8}
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
export default App;
