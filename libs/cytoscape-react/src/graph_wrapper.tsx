import React, {
  useLayoutEffect,
  useState,
  useRef,
  cloneElement,
  isValidElement,
  ReactNode,
} from "react";
import Cytoscape from "cytoscape";
// @ts-ignore
import CyDomNode from "cytoscape-dom-node";

Cytoscape.use(CyDomNode);

type Props = {
  onCytoscapeReady: (cytoscape: Cytoscape.Core) => void;
  children: ReactNode;
};

export function GraphWrapper(props: Props) {
  const { onCytoscapeReady, children } = props;
  const [cy, setInstance] = useState<Cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const domRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const cyParameters = {
      container: containerRef.current,
      style: [
        {
          selector: "node",
          style: {
            "background-opacity": 0,
            shape: ("rectangle" as Cytoscape.Css.PropertyValueNode<Cytoscape.Css.NodeShape>), // FIXME: why tsc is not able to derive this by itself?
          },
        },
      ],
    };

    const cy = Cytoscape(cyParameters);

    // TODO: provide types for DOM node extension.
    // @ts-ignore
    cy.domNode({
      dom_container: domRef.current,
    });

    setInstance(cy);
    onCytoscapeReady(cy);
  });

  const nodes_and_edges = cy
    ? React.Children.map(
        children,
        (c) => isValidElement(c) && cloneElement(c, { cy })
      )
    : [];

  return (
    <div ref={containerRef}>
      <div ref={domRef}>{nodes_and_edges}</div>
    </div>
  );
}
