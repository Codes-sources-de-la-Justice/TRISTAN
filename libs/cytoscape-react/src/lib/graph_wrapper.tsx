import React, {
  cloneElement,
  isValidElement,
  ReactNode,
  createRef,
  PropsWithChildren,
} from "react";
import Cytoscape from "cytoscape";
import CyDomNode from "./dom-node-extension";

import styled from 'styled-components';

// @ts-ignore
Cytoscape.use(CyDomNode);

type Props = {
  children: ReactNode;
  containerProps: PropsWithChildren
};

type State = {
  cy?: Cytoscape.Core;
};

const NodesAndEdgeContainer = styled.div`
  position: absolute;
`;

export class GraphWrapper extends React.Component<Props, State> {
  override state = {
    cy: undefined,
  };
  domRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  constructor(props: Props) {
 super(props);

 this.domRef = createRef();
 this.containerRef = createRef();
  }

  override componentDidMount() {
   const cyParameters = {
      container: this.containerRef.current,
      style: [
        {
          selector: "node",
          style: {
            "background-opacity": 0,
            shape:
              "rectangle" as Cytoscape.Css.PropertyValueNode<Cytoscape.Css.NodeShape>, // FIXME: why tsc is not able to derive this by itself?
          },
        },
      ],
    };

    const cy = Cytoscape(cyParameters);
    // @ts-ignore
    cy.domNode({
      dom_container: this.domRef.current
    });

    this.setState({ cy });
    this.cyReady(cy);

 }

override render() {
 const { cy } = this.state;
 const { children, containerProps } = this.props;
 const nodesAndEdges = cy ? React.Children.map(
 children, (c) => isValidElement(c) && cloneElement(c, { cy, onAdded: (id: string) => this.graphElementAdded(id) })) : [];
 return (
 <div {...containerProps} ref={this.containerRef}>
   <NodesAndEdgeContainer ref={this.domRef}>{nodesAndEdges}</NodesAndEdgeContainer>
 </div>
);
}

 cyReady(_cy: Cytoscape.Core) {}
 graphElementAdded(id: string) {}
}
