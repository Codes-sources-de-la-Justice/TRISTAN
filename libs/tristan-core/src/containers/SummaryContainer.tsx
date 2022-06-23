import React, {ReactNode, useEffect, useState} from "react";
import Summary from "./Summary";
import type { RawAnalysis } from "../static/model";
import { toBackendPayload, toGraph } from "../static";
import { db } from "../static/db";
import { StyleSheetManager } from "styled-components";

interface Error {
  stack?: string;
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <h1>Une erreur fatale est survenue, veuillez recharger TRISTAN.</h1>
      );
    }

    return this.props.children;
  }
}

export function SummaryContainer({ idj, shadowRoot }: { idj?: string, shadowRoot: HTMLElement }) {
  if (!idj) return null; // TODO: spinner?

  const backendResponse = db[idj];
  if (!backendResponse) return <h1>IDJ non trouvé</h1>;

  const [awaitedResponse, setResponse] = useState<null | RawAnalysis>(null);

  useEffect(() => {
    Promise.resolve(backendResponse).then(resp => {
      setResponse(resp);
    });
  }, [idj]);

  if (!awaitedResponse) return <h1>Chargement en cours...</h1>;

  const payload = toBackendPayload(awaitedResponse);
  const { elements } = toGraph(payload);
  const { facts, victims, indictees, witnesses, others, general } = payload;

  // TODO: add witnesses, others.
  return (
    <ErrorBoundary>
      <StyleSheetManager target={shadowRoot}>
       <Summary
      elements={elements}
      summary={{
        entities: {
          victims,
          indictees,
          witnesses,
          others,
        },
        facts: facts,
        general: general,
      }}
    />
     </StyleSheetManager>
    </ErrorBoundary>
  );
}
