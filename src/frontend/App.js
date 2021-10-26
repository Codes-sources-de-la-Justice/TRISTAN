import "./App.css";
import { getAffaires, getAffaire, getLatestAnalysis, requestAnalysis } from "./API.js"

import React, { useState, useEffect, Fragment } from "react";
import { Link, Route } from "wouter";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { HeaderNav, NavItem } from "@dataesr/react-dsfr"


import PSPDFKit from "./components/PSPDFKit.js";

import "leaflet/dist/leaflet.css";
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
	iconUrl: require('leaflet/dist/images/marker-icon.png').default,
	shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
});

const baseUrl = `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`;

const franceCenter = [ 46.7111, 1.7191 ];

const getCentroid = arr => arr.reduce((x, y) => [x[0] + y[0]/arr.length, x[1] + y[1]/arr.length], [0, 0]);

function ChangeView({center, zoom}) {
	const map = useMap()
	map.setView(center, zoom)
	return null
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
							<Marker key={`${fact.y}-${fact.x}-${fact.label}`} position={[fact.y, fact.x]}>
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

function Affaire({id}) {
	const [data, setData] = useState(null);
	const [selectedPath, setSelection] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!loading) {
			setLoading(true);
			getAffaire(id).then(setData);
			requestAnalysis(id).then(ticket => {
				console.log('analyze requested', ticket)
			})
		}
	}, [loading, id]);

	return (
		<main className="App">
			<h1>Affaire {id}</h1>
			<h2>Pièces disponibles</h2>
			<ul>
				{data?.map(piece => (
					<li key={piece.path}>
						<button onClick={() => setSelection(piece.path)}>
							{piece.path}
						</button>
					</li>
				))}
			</ul>
			<h2>Visualisations disponibles</h2>
			<ul>
				<li>Schéma pitch initial</li>
				<li>
					<Link href={`/affaires/${id}/viz/map`}>
						<a href="replace">Carte des faits</a>
					</Link>
				</li>
			</ul>
			{selectedPath && <PSPDFKit documentUrl={`http://localhost:3001/${selectedPath}`} baseUrl={baseUrl} />}
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
		</>
	);
}

export default App;
