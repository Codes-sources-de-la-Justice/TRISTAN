import React from "react";
import Summary from "./Summary";
import { toBackendPayload, toGraph } from "../static";
import { db } from "../static/db";

interface Error {
  stack?: string;
}

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>Une erreur fatale est survenue, veuillez recharger TRISTAN.</h1>
      );
    }

    return this.props.children;
  }
}

export function SummaryContainer({ idj }: { idj?: string }) {
 if (!idj) return null; // TODO: spinner?
  const backendResponse = Object.values(db)[0]; // TODO: use idj !
  const payload = toBackendPayload(backendResponse);
  const { elements } = toGraph(payload);
  const { facts, victims, indictees, witnesses, others, general } = payload;

  // TODO: add witnesses, others.
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default SummaryContainer;
