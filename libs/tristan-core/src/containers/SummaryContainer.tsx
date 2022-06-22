import React, {ReactNode} from "react";
import Summary from "./Summary";
import { toBackendPayload, toGraph } from "../static";
import { db } from "../static/db";

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

export function SummaryContainer({ idj }: { idj?: string }) {
  if (!idj) return null; // TODO: spinner?
  const backendResponse = db[idj];
  if (!backendResponse) return <h1>IDJ non trouvé</h1>;
  const payload = toBackendPayload(backendResponse);
  const { elements } = toGraph(payload);
  const { facts, victims, indictees, witnesses, others, general } = payload;

  console.log('coucou');

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
