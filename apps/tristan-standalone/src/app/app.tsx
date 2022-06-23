import "./app.module.css";

import React, { Fragment } from "react";
import { Route } from "wouter";

// import { Header, HeaderNav, NavItem } from "@dataesr/react-dsfr"
//import Joyride from "react-joyride"

import { DemoSchema, DemoSummary, db } from "@Codes-sources-de-la-justice/react-tristan";

import 'remixicon/fonts/remixicon.css';

function Demo() {
	return (
		<main>
			<h1 className="App">Démonstration de TRISTAN</h1>

			<section className="Affaires">
				{Object.entries(db).map(([key, json]) => {
					return (
						<Fragment key={key}>
							<a href={`/demo/summary/${key}`}>Visualisation de synthèse: {key}</a>
							<a href={`/demo/schema/${key}`}>Schéma de synthèse: {key}</a>
						</Fragment>
					);
				})}
			</section>
		</main>
	);
}

function Home() {
  return (
		<main>
			<h1 className="App">Shell TRISTAN standalone</h1>
			<p>Cette application est le mode standalone de TRISTAN et permet de développer TRISTAN sans les adhérences aux autres applicatifs.</p>
			<p>TRISTAN sait lire des résultats d'analyse statiques chargés (TODO autodetect), soit utiliser un backend vers une URL déjà configuée.</p>
		</main>
  );
}

function App() {
	return (
		<>
			<Route path="/">
				<Home />
			</Route>

			<Route path="/demo">
				<Demo />
			</Route>

			<Route path="/demo/schema/:key">
				{params => (<DemoSchema databaseKey={params.key} />)}
			</Route>

			<Route path="/demo/summary/:key">
				{params => (<DemoSummary databaseKey={params?.key} />)}
			</Route>
		</>
	);
}

export default App;
