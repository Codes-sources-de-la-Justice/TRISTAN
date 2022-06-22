// @ts-nocheck
import Cytoscape from "cytoscape";

/*declare module "cytoscape-dom-node" {
  const ext: Cytoscape.Ext;

  export = ext;
}*/

type CytoscapeDomNodeParameters = {
  dom_container?: HTMLElement;
  container?: {
      zIndex: number;
  }
};

class CytoscapeDomNode {
  _cy: Cytoscape.Core;
  _params: CytoscapeDomNodeParameters;
  _node_dom: Map<string, HTMLElement>; // <string, HTMLElement>
  _nodes_dom_container: HTMLElement;
  _resize_observer: ResizeObserver;

  constructor(cy: Cytoscape.Core, params: CytoscapeDomNodeParameters = {}) {
    this._cy = cy;
    this._params = params;
    this._node_dom = new Map();

    let cy_container = cy.container();

    if (params.dom_container) {
      this._nodes_dom_container = params.dom_container;
    } else {
      let nodes_dom_container = document.createElement("div");
      nodes_dom_container.style.position = "absolute";
      nodes_dom_container.style["z-index"] = params.container?.zIndex || 10;

      let cy_canvas = cy_container.querySelector("canvas");
      cy_canvas.parentNode.appendChild(nodes_dom_container);

      this._nodes_dom_container = nodes_dom_container;
    }

    this._resize_observer = new ResizeObserver((entries) => {
      for (let e of entries) {
        let node_div = e.target;
        if (!(node_div instanceof HTMLElement)) {
            continue;
        }

        let id = node_div.getAttribute('data-cytoscape-id');
        let n = cy.getElementById(id);
        n.style({ width: node_div.offsetWidth, height: node_div.offsetHeight });
      }
    });

    cy.on("add", "node", (ev: Cytoscape.EventObject) => {
      this._add_node(ev.target);
    });

    for (let n of cy.nodes()) this._add_node(n);

    cy.on("pan zoom", () => {
      let pan = cy.pan();
      let zoom = cy.zoom();

      let transform =
        "translate(" + pan.x + "px," + pan.y + "px) scale(" + zoom + ")";
      this._nodes_dom_container.style.transform = transform;
    });

    cy.on("position bounds", "node", (ev: Cytoscape.EventObject) => {
      let cy_node = ev.target;
      let id = cy_node.id();

      if (!this._node_dom.has(id)) return;

      let dom = this._node_dom.get(id);

      let style_transform = `translate(-50%, -50%) translate(${cy_node
        .position("x")
        .toFixed(2)}px, ${cy_node.position("y").toFixed(2)}px)`;
      dom.style.transform = style_transform;
      dom.style.display = "inline";
      dom.style.position = "absolute";
      // TODO: rethink z-index on individual DOM nodes.
      // dom.style["z-index"] = 10;
    });
  }

  _add_node(n: Cytoscape.Node) {
    const dom: HTMLElement = n.data("dom");

    if (!dom) return;

    const id = n.id();
    this._nodes_dom_container.appendChild(dom);
    dom.setAttribute("data-cytoscape-id", id);
    this._node_dom.set(id, dom);
    this._resize_observer.observe(dom);
  }

  node_dom(id: string) {
    return this._node_dom.get(id);
  }
}

export default function register(cy: Cytoscape.Core) {
  if (!cy) return;

  cy("core", "domNode", function (params: CytoscapeDomNodeParameters) {
    return new CytoscapeDomNode(this, params);
  });
}

// Automatic registration for consumers who use traditional <script> tags.
// @ts-ignore
if (typeof cytoscape !== "undefined") {
  // @ts-ignore
  register(cytoscape);
}
