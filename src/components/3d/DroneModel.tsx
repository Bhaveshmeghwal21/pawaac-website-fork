import * as THREE from 'three'
import React, { useMemo } from 'react'
import { useFrame } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei'

export const DroneModel = React.forwardRef<THREE.Group, JSX.IntrinsicElements['group']>((props, ref) => {
  const { scene } = useGLTF('/models/drone.glb')
  
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    
    // Center the model
    scene.position.set(-center.x, -center.y, -center.z);
    
    // Apply materials and hide environment objects
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        // Hide extraneous environment objects from the GLB
        if (/Plane|Cylinder|Sphere/i.test(mesh.name)) {
          mesh.visible = false;
          return;
        }

        const m = mesh.material as THREE.MeshStandardMaterial;
        if (m) {
          const dark = /cam|gimbal|lens|motor|servo|prop/i.test(mesh.name) || /Material\.009|Material\.003|Helice/i.test(m.name);
          m.metalness = dark ? 0.7 : 0.2;
          m.roughness = dark ? 0.2 : 0.8;
          m.color = new THREE.Color(dark ? "#111111" : "#d0d0d0");
          m.needsUpdate = true;
        }
      }
    });
    
    // Calculate a small scale (user requested small)
    return 1.5 / Math.max(size.x, size.y, size.z);
  }, [scene]);

  // Floating hover animation on the inner group
  const innerGroup = React.useRef<THREE.Group>(null)
  useFrame((state) => {
    if (innerGroup.current) {
      const t = state.clock.elapsedTime;
      // Gentle up and down
      innerGroup.current.position.y = Math.sin(t * 1.5) * 0.05;
      // Slight stabilization sway (pitch and roll)
      innerGroup.current.rotation.x = Math.sin(t * 2.1) * 0.02; // Pitch
      innerGroup.current.rotation.z = Math.cos(t * 1.8) * 0.03; // Roll
    }
  })

  // We pass the ref to the outer group so GSAP can control its global position/rotation
  return (
    <group ref={ref} {...props} dispose={null}>
      <group ref={innerGroup} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
})

DroneModel.displayName = "DroneModel";
useGLTF.preload('/models/drone.glb')
