import { useRef, useState } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { animated } from "@react-spring/three";
import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from "@react-three/postprocessing";
import { MeshPhongMaterial } from "three";

function WoodenBox({
  selectable,
  boxes,
  acceptedBoxes,
  updateCallback,
  ...props
}) {
  function ToggleBox({ position, value, state, updateCallback, selectable }) {
    const boxRef = useRef();
    const [hovered, setHover] = useState(false);

    const rotation = state ? [Math.PI + 0.2, 0, 0] : [1, 0, 0];

    const texture = useTexture(`textures/number-${value}.png`);
    const numberMaterial = new MeshPhongMaterial({
      map: texture,
      transparent: false,
      color: "#bf9178",
    });

    // Create default materials for the other faces
    const defaultMaterial = new MeshPhongMaterial({
      color: "#bf9178",
    });

    const materials = [
      defaultMaterial, // right
      defaultMaterial, // left
      numberMaterial, // top
      numberMaterial, // bottom
      defaultMaterial, // front
      defaultMaterial, // back
    ];

    return (
      <animated.group
        ref={boxRef}
        position={position}
        rotation={rotation}
        onClick={() => {
          if (selectable) {
            updateCallback(!state);
          }
        }}
      >
        <Select enabled={hovered && selectable}>
          <mesh
            castShadow
            position={[0, 0.03, -0.02]}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            material={materials}
          >
            <boxGeometry args={[0.03, 0.01, 0.09]} />
          </mesh>
        </Select>
      </animated.group>
    );
  }

  const { nodes, materials } = useGLTF("models/box.glb");
  const groupRef = useRef();

  function updateInnerBoxesCallback(index, state) {
    updateCallback(index, state);
  }

  return (
    <>
      <group ref={groupRef} {...props} dispose={null}>
        <mesh
          receiveShadow
          geometry={nodes.Cube_1.geometry}
          material={materials.Wood}
        />
        <mesh
          receiveShadow
          geometry={nodes.Cube_2.geometry}
          material={materials["Snooker Pool Table Cloth"]}
        />

        <Selection>
          <EffectComposer autoClear={false}>
            <Outline
              blur
              visibleEdgeColor="#bbbbbb"
              edgeStrength={5}
              width={500}
            />
          </EffectComposer>
          {boxes.map((boxState, index) => (
            <ToggleBox
              key={index}
              position={[0.034 * index - 0.19, 0.06, -0.2]}
              value={index + 1}
              state={boxState}
              updateCallback={(state) => updateInnerBoxesCallback(index, state)}
              selectable={selectable && !acceptedBoxes[index]}
            />
          ))}
        </Selection>
      </group>
    </>
  );
}

export default WoodenBox;
