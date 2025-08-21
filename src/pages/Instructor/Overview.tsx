import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const Box = () => {
  return (
    <mesh rotation={[0.4, 0.2, 0]} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};

const Overview = () => {
  return (
    <div
      style={{
        width: "600px",
        height: "400px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Overview;
