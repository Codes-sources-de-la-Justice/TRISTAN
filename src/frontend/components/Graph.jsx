import { useState, useEffect } from "react";
import { Circle, Arrow, Group, Text, Path, Rect } from "react-konva";
import dagre from "dagre";

import { faQuestion } from "@fortawesome/free-solid-svg-icons";

const unk_icon = faQuestion; // question

function FontAwesomeIcon({ icon, ...props }) {
  const [width, height, _, __, pathData] = icon.icon;
  return (
    <Path data={pathData} scaleX={0.05} scaleY={0.05} fill="blue" {...props} />
  );
}

function renderIcon(node) {
  const { label, width, height, icon } = node;

  return (
    <>
			<Rect width={width} height={height} stroke='black' />
			{/* <Circle width={width} height={height} stroke="red" /> */}
      <FontAwesomeIcon icon={icon || unk_icon} x={width / 2} />
      {label && (
        <Text
					offsetY={-30}
          text={label}
          width={width}
          height={height}
					align='center'
        />
      )}
    </>
  );
}

function GraphNode({ node, ...props }) {
  const { type, x, y, width, height } = node;

  return (
    <Group x={x - (width/2)} y={y - (height/2)}>
      {renderIcon(node)}
    </Group>
  );
}

function GraphEdge({ edge, ...props }) {
  const { points, x, y } = edge;

  if (!points) return null;

  return (
    <Arrow
      points={points.map((p) => [p.x, p.y]).flat()}
      fill="blue"
      stroke="blue"
    />
  );
}

function computeLayout(g) {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      dagre.layout(g);
      resolve();
    });
  });
}

function GraphScene({ graph, ...props }) {
  // Compute using dagre the layout.
  // Once it is ready, show the graph scene.
  const [ready, setReady] = useState(false);
  const { shouldComputeLayout, ...otherProps } = props;

  useEffect(() => {
    if (shouldComputeLayout) {
      setReady(false);
      computeLayout(graph).then(() => {
        setReady(true);
      });
    }
  }, [graph, shouldComputeLayout]);

  if (!ready) {
    return <Text text={"Computing the layout..."} />;
  }

  return (
    <Group {...otherProps}>
      <Group>
        {graph.nodes().map((node, index) => (
          <GraphNode node={graph.node(node)} key={index} />
        ))}
      </Group>
      <Group>
        {graph.edges().map((edge, index) => (
          <GraphEdge edge={graph.edge(edge)} key={index} />
        ))}
      </Group>
    </Group>
  );
}

GraphScene.defaultProps = {
  shouldComputeLayout: true,
};

const Graph = {
  Graph: GraphScene,
  Edge: GraphEdge,
  Node: GraphNode,
};

export default Graph;
