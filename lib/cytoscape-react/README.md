# cytoscape-react

Fork of <https://github.com/mwri/cytoscape-react> with TypeScript support and simplified codebase with React Hooks.

Make Cytoscape nodes into React Components!

## Dependencies

* cytoscape ^3.19.0
* react ^17.0.2
* react-dom ^17.0.2

## Usage instructions

**TODO: add example for layout support**

Three functional components are made available by `cytoscape-react`, an example would be something like this:

```js
import { GraphWrapper, NodeWrapper, EdgeWrapper } from 'cytoscape-react';

function MyGraphWrapper() {
  return (
    <GraphWrapper>
              <CyReact.NodeWrapper key="foo" id="foo">
                    <p>Test</p>
                </CyReact.NodeWrapper>
                <CyReact.NodeWrapper key="bar" id="bar">
                    <p>Test</p>
                </CyReact.NodeWrapper>
                <CyReact.NodeWrapper key="bazzz" id="bazzz">
                    <p>Test</p>
                </CyReact.NodeWrapper>
                <CyReact.EdgeWrapper key="foo_bar" id="foo_bar" source="foo" target="bar"/>
                <CyReact.EdgeWrapper key="bar_bazzz" id="bar_bazzz" source="bar" target="bazzz"/>
    </GraphWrapper>
  );
}
```

The children of any wrapper can be replaced by a component, e.g.

```js
function MagentaComponent({id}) { return (<div style={{textColor: "magenta"}}>magenta {id}</div>); }
```

Replacing the children of an edge wrapper is difficult though.
