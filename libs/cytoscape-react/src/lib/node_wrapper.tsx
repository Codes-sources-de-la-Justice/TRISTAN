import React, { useLayoutEffect, useRef, RefObject, ReactNode } from "react";
import Cytoscape from 'cytoscape';

type Props = {
  cy: Cytoscape.Core;
  id: string;
  children: ReactNode;
};

function initializeCytoscape(domNode: RefObject<HTMLElement>, props: Props) {
  const { cy, id } = props;
  if (cy && cy.getElementById(id).length === 0) {
    cy.add({
      data: {
        ...props,
        dom: domNode.current,
      },
    });
  }
}

export function NodeWrapper(props: Props) {
  const { children, cy } = props;
  const wrapper = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    initializeCytoscape(wrapper, props);
  }, [cy]);

  return (
    <div style={{ display: "contents" }} ref={wrapper}>
      {children}
    </div>
  );
}
