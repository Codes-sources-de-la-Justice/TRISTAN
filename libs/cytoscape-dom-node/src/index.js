class CytoscapeDomNode {
    constructor(cy, params = {}) {
        var _a;
        Object.defineProperty(this, "_cy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_node_dom", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // <string, HTMLElement>
        Object.defineProperty(this, "_nodes_dom_container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_resize_observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._cy = cy;
        this._params = params;
        this._node_dom = new Map();
        let cy_container = cy.container();
        if (params.dom_container) {
            this._nodes_dom_container = params.dom_container;
        }
        else {
            let nodes_dom_container = document.createElement("div");
            nodes_dom_container.style.position = "absolute";
            nodes_dom_container.style["z-index"] = ((_a = params.container) === null || _a === void 0 ? void 0 : _a.zIndex) || 10;
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
        cy.on("add", "node", (ev) => {
            this._add_node(ev.target);
        });
        for (let n of cy.nodes())
            this._add_node(n);
        cy.on("pan zoom", () => {
            let pan = cy.pan();
            let zoom = cy.zoom();
            let transform = "translate(" + pan.x + "px," + pan.y + "px) scale(" + zoom + ")";
            this._nodes_dom_container.style.transform = transform;
        });
        cy.on("position bounds", "node", (ev) => {
            let cy_node = ev.target;
            let id = cy_node.id();
            if (!this._node_dom.has(id))
                return;
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
    _add_node(n) {
        const dom = n.data("dom");
        if (!dom)
            return;
        const id = n.id();
        this._nodes_dom_container.appendChild(dom);
        dom.setAttribute("data-cytoscape-id", id);
        this._node_dom.set(id, dom);
        this._resize_observer.observe(dom);
    }
    node_dom(id) {
        return this._node_dom.get(id);
    }
}
export default function register(cy) {
    if (!cy)
        return;
    cy("core", "domNode", function (params) {
        return new CytoscapeDomNode(this, params);
    });
}
// Automatic registration for consumers who use traditional <script> tags.
// @ts-ignore
if (typeof cytoscape !== "undefined") {
    // @ts-ignore
    register(cytoscape);
}
