import React, { ReactNode, useEffect, useState } from "react";
import Summary from "./Summary";
import type { RawAnalysis } from "../static/model";
import { toBackendPayload, toGraph } from "../static";
import { db } from "../static/db";
import { Layout } from "../components/Layout";
import { DefaultTheme } from "styled-components";

export function SummaryContainer({
  idj,
  shadowRoot,
  theme,
}: {
  idj?: string;
  shadowRoot: HTMLElement;
  theme: DefaultTheme;
}) {
  if (!idj) return null; // TODO: spinner?

  const backendResponse = db[idj];
  if (!backendResponse) return <h1>IDJ non trouvé</h1>;

  const [awaitedResponse, setResponse] = useState<null | RawAnalysis>(null);

  useEffect(() => {
    Promise.resolve(backendResponse).then((resp) => {
      setResponse(resp);
    });
  }, [idj]);

  if (!awaitedResponse) return <h1>Chargement en cours...</h1>;

  const payload = toBackendPayload(awaitedResponse);
  const { elements } = toGraph(payload);
  const { facts, victims, indictees, witnesses, others, general } = payload;

  // TODO: add witnesses, others.
  return (
    <Layout target={shadowRoot} theme={theme}>
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
    </Layout>
  );
}
