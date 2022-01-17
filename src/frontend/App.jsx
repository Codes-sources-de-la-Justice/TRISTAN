import "./App.css";
import { getAffaires, getAffaire, getLatestAnalysis, requestAnalysis } from "./API.js"

import React, { useState, useEffect, Fragment } from "react";
import { Link, Route } from "wouter";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { HeaderNav, NavItem } from "@dataesr/react-dsfr"

//import Joyride from "react-joyride"
import TreeMenu from "react-simple-tree-menu"

import Schema from "./containers/Schema.jsx";
import ExampleGraph from "./components/ExampleGraph.js";
import { fromRawTimeline } from "./utils/Layout.js";

import PSPDFKit from "./components/PSPDFKit.jsx";

import "react-simple-tree-menu/dist/main.css";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl,
	iconUrl,
	shadowUrl
});

const baseUrl = `${window.location.protocol}//${window.location.host}/${import.meta.env.BASE_URL}`;
console.log('baseUrl', baseUrl);

const franceCenter = [ 46.7111, 1.7191 ];

const getCentroid = arr => arr.reduce((x, y) => [x[0] + y[0]/arr.length, x[1] + y[1]/arr.length], [0, 0]);

function ChangeView({center, zoom}) {
	const map = useMap()
	map.setView(center, zoom)
	return null
}

function createDeepObject(tree, path) {
	const s = path.split('/')

	let subobj = tree

	s.forEach(p => {
		subobj[p] = Object.assign({
			label: p,
			nodes: {},
		}, subobj[p] || {});
		subobj = subobj[p].nodes
	})

	return tree
}

function buildFilesystemTree(data) {
	let tree = {}
	data?.forEach(piece => {
		tree = createDeepObject(tree, piece.path)
	});
	return tree
}

function AuditionItem({item, key}) {
	return (
		<div>
			<h2>Audition n°{key}</h2>
			{item.map(qa => (
				<div>
					<h3>Question : {qa[0]}</h3>
					<h3>Réponse : {qa[1]}</h3>
				</div>
			))}
		</div>
	);
}

function Auditions({id}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!loading) {
			setLoading(true);
			getLatestAnalysis(id).then(setData);
		}
	}, [loading, id]);

	const auditions = data?.filter(p => p.payload.type === "qa").flatMap(p => p.payload.auditions || []);

	return (
		<div>
			{auditions && auditions.map((audition, index) => (<AuditionItem key={index} item={audition} />))}
			{(!auditions || auditions.length === 0) && <h1>Aucune audition</h1>}
		</div>
	);
}

function Timeline({id}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		if (!loading) {
			setLoading(true)
			getLatestAnalysis(id).then(setData);
		}
	}, [loading, id]);

	const timelines = data?.filter(p => p.payload.type === "timeline")

	if (!timelines || timelines.length === 0) {
		return null
	}

	const timeline = fromRawTimeline(timelines[0].payload.graph)

	return (
		<Schema graph={timeline} />
	);
}

function Map({id}) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [currentOpenedSource, setSource] = useState(null);

	useEffect(() => {
		if (!loading) {
			setLoading(true)
			getLatestAnalysis(id).then(setData);
		}
	}, [loading, id]);

	const positions = data?.filter(a => a.payload.type === "map").flatMap(({payload}) => payload.facts.map(fact => [parseFloat(fact.y), parseFloat(fact.x)]));

	console.log(positions)
	const center = getCentroid(positions ?? [franceCenter])
	const zoom = 13

	return (
		<>
			{!!currentOpenedSource && <PSPDFKit documentUrl={`http://localhost:3001/${currentOpenedSource}`} baseUrl={baseUrl} onClose={() => setSource(null)} />}
			{!currentOpenedSource && (<MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{width: "100%", height: "100vh"}}>
				<ChangeView center={center} zoom={zoom} />
				<TileLayer
					attribution='&copy; Contributeurs <a href="https://osm.org/copyright">OpenStreetMap</a>'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{data?.filter(analysis => analysis.payload.type === "map").flatMap(({payload}) => payload.facts.map(fact => (
							<Marker key={`${fact.y}-${fact.x}-${fact.natinf}`} position={[fact.y, fact.x]}>
								<Popup>
									Fait de {fact.label} rapporté à {fact.started_at_utc} (NATINF: {fact.natinf})
									<button onClick={() => setSource(fact.source)}>Ouvrir la source</button>
								</Popup>
							</Marker>
						))
				)}
			</MapContainer>)}
		</>
	);
}

const affaireSteps = [
	{
		target: '.App h1',
		content: "Bienvenue dans la dashboard de votre première affaire, ceci est votre centre de contrôle personnel!"
	},
	{
		target: '.liste-pieces',
		content: "Ceci est la liste des pièces disponibles dans cette affaire"
	},
	{
		target: '.liste-pieces li:first-child',
		content: "Vous pouvez cliquer sur l'une d'entre elle pour l'afficher!"
	},
	{
		target: '.visualisations',
		content: "Voici les visualisations que TRISTAN vous met à disposition automatiquement"
	},
	{
		target: '.visualisations li:first-child',
		content: "Par exemple, vous pouvez cliquer sur celle-ci !"
	}
];

function Affaire({id}) {
	const [data, setData] = useState(null);
	const [currentPayloads, setCurrentPayloads] = useState(null);
	const [selectedPath, setSelection] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!loading) {
			setLoading(true);
			getAffaire(id).then(setData);
			requestAnalysis(id).then(ticket => {
				console.log('analyze requested', ticket)
			})
			getLatestAnalysis(id).then(payloads => {
				console.log('latest analysis available', payloads)
				setCurrentPayloads(payloads)
			});
		}
	}, [loading, id]);

	const isAnalysisAvailable = type => currentPayloads?.filter(p => p.type === type).length >= 1
	const getPayload = type => currentPayloads?.filter(p => p.type === type)[0].payload

	const hierarchyTree = data ? buildFilesystemTree(data) : [];

	return (
		<main className="App">
			{/* <Joyride steps={affaireSteps} continuous={true} showSkipButton={true} /> */}
			<section className="App-dual-workflow">
				<section className="liste-pieces-container">
					<ul className="liste-pieces">
						<TreeMenu data={hierarchyTree} onClickItem={({key, label, ...props}) => {
							if (!props.hasNodes) setSelection(key)
						}}/>
					</ul>
				</section>
				<section>
					<h1 className="dashboard-title">Affaire {id} - Dashboard</h1>
					<h2>Visualisations disponibles</h2>
					<ul className="visualisations">
						<li>
							<Link href={`/affaires/${id}/viz/timeline`}>
								<a href="replace" disabled={isAnalysisAvailable("timeline")}>Schéma pitch initial</a>
							</Link>
						</li>
						<li>
							<Link href={`/affaires/${id}/viz/map`}>
								<a href="replace" disabled={isAnalysisAvailable("map")}>Carte des faits</a>
							</Link>
						</li>
						<li>
							<Link href={`/affaires/${id}/viz/qa`}>
								<a href="replace" disabled={isAnalysisAvailable("qa")}>Auditions</a>
							</Link>
						</li>
					</ul>
					{selectedPath && <PSPDFKit documentUrl={`http://localhost:3001/${selectedPath}`} baseUrl={baseUrl} />}
				</section>
			</section>
		</main>
	);
}

function AffaireItem({id, title}) {
	// on click, go load the affaire.
	return (
		<section className="Affaire">
			<h3>
				<Link href={`/affaires/${id}`}>
					<a href="replace">Affaire {title}</a>
				</Link>
			</h3>
		</section>
	);
}

function Home() {
	const [affaires, setAffaires] = useState([]);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (!loading) {
			setLoading(true);
			getAffaires()
				.then(setAffaires);
		}
	}, [loading]);
  return (
		<main>
			<h1 className="App">TRISTAN</h1>
			<h2 className="App">Liste des affaires</h2>
			<section className="Affaires">
				{affaires.map(affaire => (<Fragment key={affaire.id}><AffaireItem  {...affaire} /><hr/></Fragment>))}
			</section>
		</main>
  );
}

function App() {
	return (
		<>
			<HeaderNav>
				<NavItem title="Liste des affaires"
					asLink={<Link href="/" />} />
			</HeaderNav>

			<Route path="/">
				<Home />
			</Route>

			<Route path="/affaires/:id">
				{params => <Affaire id={params.id} />}
			</Route>

			<Route path="/affaires/:id/viz/map">
				{params => <Map id={params.id} />}
			</Route>

			<Route path="/affaires/:id/viz/qa">
				{params => <Auditions id={params.id} />}
			</Route>

			<Route path="/affaires/:id/viz/timeline">
				{params => <Timeline id={params.id} />}
			</Route>

			<Route path="/demo/schema">
				<Schema graph={ExampleGraph} />
			</Route>
		</>
	);
}

export default App;
