import React, { Fragment } from "react";
import {
  HashRouter as Router,
  Route,
  Link,
  Routes,
  useParams,
} from "react-router-dom";
import { DefaultTheme } from "styled-components";

// import { Header, HeaderNav, NavItem } from "@dataesr/react-dsfr"
//import Joyride from "react-joyride"

import {
  SchemaContainer,
  SummaryContainer,
  db,
} from "@codes-sources-de-la-justice/react-tristan";

import "remixicon/fonts/remixicon.css";

function Demo() {
  return (
    <main>
      <h1>Démonstration de TRISTAN</h1>

      <section>
        {Object.entries(db).map(([key, json]) => {
          return (
            <Fragment key={key}>
							<Link to={`/summary/${key}`}>
                Visualisation de synthèse: {key}
              </Link>
							<Link to={`/schema/${key}`}>Schéma de synthèse: {key}</Link>
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
      <p>
        Cette application est le mode standalone de TRISTAN et permet de
        développer TRISTAN sans les adhérences aux autres applicatifs.
      </p>
      <p>
        TRISTAN sait lire des résultats d'analyse statiques chargés (TODO
        autodetect), soit utiliser un backend vers une URL déjà configuée.
      </p>
      <Link to="demo">Aller à la demo</Link>
    </main>
  );
}

const standaloneTheme: DefaultTheme = {
  standalone: true,
};

function ParametrizedContainer(shadowRoot: HTMLElement, theme: DefaultTheme, component: any) {
  return function () {
    const params = useParams();
    return React.createElement(component, {
      idj: params["key"],
      shadowRoot,
      theme,
    });
  };
}

function App() {
  const head = document.documentElement;
  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
					<Route path="demo" element={<Demo />} />
          <Route
            path="schema/:key"
            element={React.createElement(
              ParametrizedContainer(head, standaloneTheme, SchemaContainer)
            )}
          />
          <Route
            path="summary/:key"
            element={React.createElement(
              ParametrizedContainer(head, standaloneTheme, SummaryContainer)
            )}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
