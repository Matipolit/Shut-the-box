import { useRef, useState, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import "./App.css";

import WoodenBox from "./WoodenBox";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

const GameState = Object.freeze({
  START: 0,
  THROWING_CUBES: 1,
  CUBES_THROWN: 2,
  NEXT_ROUND: 3,
  WON: 4,
  LOST: 5,
});

// Utility function to get a random dice roll
const getRandomRoll = () => Math.floor(Math.random() * 6) + 1;

function getRandomRotation() {
  const values = [-Math.PI / 2, -Math.PI, Math.PI / 2, Math.PI];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

// Convert dice value to rotation
const getRotationFromValue = (value) => {
  switch (value) {
    case 1:
      return [0, getRandomRotation(), Math.PI / 2];
    case 2:
      return [-Math.PI, getRandomRotation(), Math.PI / 2];
    case 3:
      return [0, getRandomRotation(), 0];
    case 4:
      return [Math.PI, getRandomRotation(), 0];
    case 5:
      return [-Math.PI / 2, 0, getRandomRotation()];
    case 6:
      return [Math.PI / 2, 0, getRandomRotation()];
    default:
      return [0, 0, 0];
  }
};

function Cube({ position, rotationSpeed, rotation, stopRotation, visible }) {
  const ref = useRef();
  const textures = useTexture([
    "textures/dice1.png",
    "textures/dice2.png",
    "textures/dice3.png",
    "textures/dice4.png",
    "textures/dice5.png",
    "textures/dice6.png",
  ]);

  // Rotate the cube
  useFrame(() => {
    if (!stopRotation) {
      ref.current.rotation.x += rotationSpeed;
      ref.current.rotation.y += rotationSpeed;
    } else {
      const [x, y, z] = rotation;
      ref.current.rotation.set(x, y, z);
    }
  });

  return (
    <mesh position={position} ref={ref} receiveShadow={true} castShadow={true}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial
          attach={`material-${index}`}
          key={texture.id}
          map={texture}
          transparent={visible}
        />
      ))}
    </mesh>
  );
}

function App() {
  const [gameState, setGameState] = useState(GameState.START);
  const [cubes, setCubes] = useState([1, 1]);
  const [boxes, setBoxes] = useState(Array(12).fill(false));
  const [acceptedBoxes, setAcceptedBoxes] = useState(Array(12).fill(false));
  const [boxesToAccept, setBoxesToAccept] = useState(Array(12).fill(false));
  const [currentSum, setCurrentSum] = useState(0);
  const [width, height] = useWindowSize();

  const cameraPosition = width < 600 ? [0, 0.5, 0.4] : [0, 0.42, 0.32];
  const canvasHeight = height * 0.7;

  const [rotations, setRotations] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ]);

  function boxSelectedCallback(index, value) {
    console.log("box selected callback: ", index, value);
    let newBoxes = [...boxes];
    newBoxes[index] = value;
    setBoxes(newBoxes);
    if (value) {
      setCurrentSum(currentSum + index + 1);
      let newBoxesToAccept = [...boxesToAccept];
      newBoxesToAccept[index] = true;
      setBoxesToAccept(newBoxesToAccept);
    } else {
      setCurrentSum(currentSum - index - 1);
      let newBoxesToAccept = [...boxesToAccept];
      newBoxesToAccept[index] = false;
      setBoxesToAccept(newBoxesToAccept);
    }
  }

  function acceptBoxes() {
    console.log("accepting boxes");
    setAcceptedBoxes([...boxesToAccept]);
    setCurrentSum(0);
    if (boxesToAccept.includes(false)) {
      setGameState(GameState.NEXT_ROUND);
    } else {
      setGameState(GameState.WON);
    }
  }

  function newGame() {
    setGameState(GameState.START);
    setAcceptedBoxes(Array(12).fill(false));
    setBoxesToAccept(Array(12).fill(false));
    setBoxes(Array(12).fill(false));
    setCurrentSum(0);
  }

  function throwCubes() {
    setGameState(GameState.THROWING_CUBES);
    const newCubes = [getRandomRoll(), getRandomRoll()];
    setCubes(newCubes);
    setRotations([
      getRotationFromValue(newCubes[0]),
      getRotationFromValue(newCubes[1]),
    ]);

    // Stop rotation after 2 seconds
    setTimeout(() => {
      setGameState(GameState.CUBES_THROWN);
    }, 1000);
  }

  return (
    <div className="game">
      <div className="controls">
        {gameState == GameState.START ? (
          <h1>Gra zamknij skrzynkę</h1>
        ) : gameState == GameState.THROWING_CUBES ? (
          <>
            <h1>Losuję...</h1>
            <br></br>
          </>
        ) : gameState == GameState.CUBES_THROWN ? (
          <>
            <h1>Wybierz klocki</h1>
            <span>
              Wyrzucone kostki:{" "}
              <b>
                {cubes[0]} + {cubes[1]} = {cubes[0] + cubes[1]}
              </b>
            </span>
            <span>
              Aktualna suma:{" "}
              {currentSum != cubes[0] + cubes[1] ? (
                <>
                  <span className="red">{currentSum}</span>
                  <br></br>
                  <button onClick={() => setGameState(GameState.LOST)}>
                    Poddaj się
                  </button>
                </>
              ) : (
                <>
                  <span className="green">{currentSum}</span>
                  <br></br>
                  <button onClick={acceptBoxes}>Akceptuj ustawienie</button>
                </>
              )}
            </span>
          </>
        ) : gameState == GameState.NEXT_ROUND ? (
          <h1>Kolejna runda!</h1>
        ) : gameState == GameState.LOST ? (
          <>
            <h1>Przegrałeś 😥</h1>
            <button onClick={newGame}>Nowa gra</button>
          </>
        ) : (
          <h1>Wygrałeś! 🎉</h1>
        )}

        {(gameState == GameState.START ||
          gameState == GameState.NEXT_ROUND) && (
          <button onClick={throwCubes}>Rzuć kośćmi</button>
        )}
      </div>
      <Canvas
        camera={{ position: cameraPosition }}
        style={{ width: width + "px", height: canvasHeight + "px" }}
        shadows={true}
      >
        <ambientLight intensity={0.7} />
        <pointLight
          position={[-0.3, 0.8, 0.6]}
          intensity={2}
          castShadow={true}
        />
        <OrbitControls />
        <WoodenBox
          selectable={gameState == GameState.CUBES_THROWN}
          boxes={boxes}
          acceptedBoxes={acceptedBoxes}
          updateCallback={(index, value) => boxSelectedCallback(index, value)}
        />
        <Cube
          position={[-0.12, 0.01, 0.1]}
          rotationSpeed={0.1}
          rotation={rotations[0]}
          stopRotation={gameState != GameState.THROWING_CUBES}
          visible={
            gameState == GameState.THROWING_CUBES ||
            gameState == GameState.CUBES_THROWN
          }
        />
        <Cube
          position={[0.12, 0.01, 0.1]}
          rotationSpeed={0.1}
          rotation={rotations[1]}
          stopRotation={gameState != GameState.THROWING_CUBES}
          visible={
            gameState == GameState.THROWING_CUBES ||
            gameState == GameState.CUBES_THROWN
          }
        />
      </Canvas>
    </div>
  );
}

export default App;
