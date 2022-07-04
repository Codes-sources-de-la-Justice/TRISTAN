import React, { useState, useCallback, useEffect } from "react";
import Schema from "./Schema";
import {
  toBackendPayload,
  toGraph,
  getClosedNeighborWithDepth,
  GenericNodeData,
} from "../static";
import { db } from "../static/db";
import { RawAnalysis } from "../static/model";
import { LayoutParameters } from "../components/SchemaDebug/Toolbar";
import { Layout } from "../components/Layout";
import { DefaultTheme } from "styled-components";

//import { DebugBarLayout, LayoutParameters } from './SchemaDebug/Toolbar'

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void
) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        event.target instanceof Element &&
        !ref.current.contains(event.target)
      ) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export function SchemaContainer({
  idj,
  shadowRoot,
  theme
}: {
  idj?: string;
  shadowRoot: HTMLElement;
  theme: DefaultTheme;
}) {
  const [selection, setSelection] = useState<GenericNodeData[]>([]);
  const [layoutParameters, setLayoutParameters] = useState<LayoutParameters>({
    nodeRepulsion: 1000,
    nodeSeparation: 500,
    idealEdgeLength: 100,
    constantEdgeElasticity: 0.1,
  });

  const [awaitedResponse, setResponse] = useState<null | RawAnalysis>(null);

  const onSelect = useCallback(
    (node: GenericNodeData) => {
      const alreadyHere = selection.map((n) => n.id).includes(node.id);

      if (!alreadyHere) {
        setSelection([...selection, node]);
      }
    },
    [selection]
  );

  const onUnselect = useCallback(
    (node: GenericNodeData) => {
      setSelection(selection.filter((n) => n.id !== node.id));
    },
    [selection]
  );

  const [layoutConstraints, setLayoutConstraints] = useState({});
  const backendResponse = !!idj ? db[idj] : null;
  let payload = awaitedResponse && toBackendPayload(awaitedResponse);
  let summaryData = payload && toGraph(payload);
  useEffect(() => {
    if (!backendResponse) return;
    Promise.resolve(backendResponse).then((resp) => {
	 setResponse(resp);

				payload = toBackendPayload(resp);
				summaryData = toGraph(payload);
			setLayoutConstraints(summaryData.layoutConstraints);
    });
  }, [idj]);

  if (!idj) return null; // TODO: spinner
  if (!backendResponse) return <h1>IDJ non trouvé</h1>;
	if (!summaryData) return <h1>Chargement en cours...</h1>;

  const getProperNeigh = (node: cytoscape.NodeDataDefinition) => {
    if (!node.id) return [];

    const [_, neigh] = getClosedNeighborWithDepth(
 node.id,
 // @ts-ignore
      summaryData.elements,
      2
    );

    return Array.from(neigh);
  };

  const nonGhostIds = selection.flatMap(getProperNeigh);
  const ghostIds =
    selection.length > 0
      ? summaryData.elements
          .filter(
            (n) =>
              n.group === "nodes" &&
              n.data.id !== undefined &&
              !nonGhostIds.includes(n.data.id)
          )
          .map((n) => n.data.id as string)
      : [];

  const onOutClick = () => {
    setSelection([]);
  };

  return (
  <Layout target={shadowRoot} theme={theme}>
      {/* <DebugBarLayout
  onChangeConstraints={setLayoutConstraints}
  onChangeLayout={setLayoutParameters}
  constraints={layoutConstraints}
  elements={summaryData.elements}
  layoutParameters={layoutParameters}
/> */}
      <Schema
        elements={summaryData.elements}
        layoutConstraints={layoutConstraints}
        layoutParameters={layoutParameters}
        onSelect={onSelect}
        onUnselect={onUnselect}
        onOutClick={onOutClick}
        ghostIds={ghostIds}
        selectedIds={selection.map((n) => n.id)}
      />
    </Layout>
  );
}
