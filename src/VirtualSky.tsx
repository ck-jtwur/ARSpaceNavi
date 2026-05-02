import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

type VirtualSkyProps = {
  heading: number;
  pitch: number;
};

const radians = Math.PI / 180;

function StarField({ heading, pitch }: VirtualSkyProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += ((heading * radians) - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += ((-pitch * radians) - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Stars radius={120} depth={58} count={6200} factor={4.2} saturation={0.08} fade speed={0.55} />
    </group>
  );
}

export default function VirtualSky({ heading, pitch }: VirtualSkyProps) {
  return (
    <div className="virtual-sky" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 1], fov: 70 }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}>
        <color attach="background" args={["#02050b"]} />
        <StarField heading={heading} pitch={pitch} />
      </Canvas>
    </div>
  );
}
