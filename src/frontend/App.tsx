import "./App.css";

import React, { Fragment } from "react";
import { Route } from "wouter";

// import { Header, HeaderNav, NavItem } from "@dataesr/react-dsfr"

import { db } from './static/db.js';

//import Joyride from "react-joyride"

import DemoSchema from "./components/DemoSchema";
import DemoSummary from "./components/DemoSummary";

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
			<h1 className="App">TRISTAN</h1>
		</main>
  );
}

function App() {
	return (
		<>
			{/*
			TODO: réparer.
			<Header>
				<HeaderNav path="/">
					<NavItem
						title="Liste des affaires"
						asLink={<Link href="/" />}
					/>
				</HeaderNav>
			</Header>*/}

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
