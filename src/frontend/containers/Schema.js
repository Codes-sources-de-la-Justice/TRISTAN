import Logos from "../logos";

import React, { useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

import Graph from "../components/Graph";

function Logo({ logo, ...props }) {
  const [image] = useImage(Logos[logo]);
  return <KonvaImage image={image} width={100} height={100} {...props} />;
}

function Schema({graph}) {
	const [stage, setStage] = useState({
		scale: 1,
		x: 0,
		y: 0
	})
	// TODO: generalize zoomable & pannable stages.
	// TODO: handle better values for scaleBy.
	// TODO: handle onTouchEnd events.
	const handleWheel = e => {
		e.evt.preventDefault();

		const scaleBy = 1.15
		const stage = e.target.getStage()
		const oldScale = stage.scaleX()

		const mousePointTo = {
			x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
			y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
		};

		const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy

		setStage({
			scale: newScale,
			x: (-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale),
			y: (-(mousePointTo.y - stage.getPointerPosition().y / newScale ) * newScale)
		});
	}

  return (
    <Stage
			draggable
			onWheel={handleWheel}
      width={window.innerWidth}
      height={window.innerHeight}
			scaleX={stage.scale}
			scaleY={stage.scale}
			x={stage.x}
			y={stage.y}
    >
      <Layer>
        <Logo logo="GN" y={150} width={150} />
        <Logo logo="Douane" y={270} width={116} />
        <Logo logo="MJ" y={400} width={123} />
        <Graph.Graph graph={graph} x={150} y={100} />
      </Layer>
    </Stage>
  );
}
export default Schema;
