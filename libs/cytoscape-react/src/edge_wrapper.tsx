import React, {
  ReactNode,
  cloneElement,
  isValidElement,
  useState,
  useLayoutEffect,
  SetStateAction,
  Dispatch,
} from "react";

type Props = {
  cy: any;
  id: string;
  source: string;
  target: string;
  children: ReactNode;
};

function initializeCytoscape(
  props: Props,
  setMissing: Dispatch<SetStateAction<number>>
) {
  const { id, cy, source, target } = props;

  const remaining =
    2 - cy.getElementById(source).length - cy.getElementById(target).length;

  setMissing(remaining);

  function watchForMissingNodes(event: any) {
    const targetId = event.target.id();

    if (targetId === source || targetId === target) {
      setMissing((missing: number) => {
        if (missing === 1) {
          cy.off("add", "node", watchForMissingNodes);
        }

        return missing - 1;
      });
    }
  }

  if (remaining > 0) {
    cy.on("add", "node", watchForMissingNodes);
  } else {
    if (cy.getElementById(id).length === 0) {
      cy.add({ group: "edges", data: props });
    }
  }

  return () => {
    if (cy) {
      const elt = cy.getElementById(id);
      if (elt.length !== 0) {
        cy.remove(elt);
      }
      if (remaining > 0) {
        cy.off("add", "node", watchForMissingNodes);
      }
    }
  };
}

export function EdgeWrapper(props: Props) {
  const { cy, children } = props;
  const [missing, setMissing] = useState(2);

  useLayoutEffect(() => {
    return initializeCytoscape(props, setMissing);
  }, [cy, missing]);

  return isValidElement(children) ? cloneElement(children, props) : null;
}
