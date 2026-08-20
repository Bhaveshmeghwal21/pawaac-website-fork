"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float, Html, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { DroneModel } from "./DroneModel";
import * as THREE from "three";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

function DroneController() {
  const groupRef = useRef<THREE.Group>(null);
  const droneRef = useRef<THREE.Group>(null);
  
  const hudRefGPS = useRef<HTMLDivElement>(null);
  const hudStateGPS = useRef({ opacity: 0, scale: 0.8 });
  
  const hudRefAI = useRef<HTMLDivElement>(null);
  const hudStateAI = useRef({ opacity: 0, scale: 0.8 });

  const { scene } = useGLTF("/models/drone.glb");
  const prefersReducedMotion = usePrefersReducedMotion();

  scene.traverse((child: any) => {
    if (child.isMesh) {
      if (child.name === "Plane" || child.name === "Cylinder" || child.name === "Sphere") {
        child.visible = false;
      }
    }
  });

  useFrame(() => {
    if (prefersReducedMotion || !groupRef.current || !droneRef.current) return;

    // Use 768px (standard mobile) so desktop users with smaller windows don't trigger it
    const isMobile = window.innerWidth < 768;

    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    // --- PHYSICS FADE FOR GPS HOLOGRAPHIC HUD ---
    const targetHudOpacityGPS = (!isMobile && progress >= 0.55 && progress <= 0.68) ? 1 : 0;
    const targetHudScaleGPS = (!isMobile && progress >= 0.55 && progress <= 0.68) ? 0.9 : 0.7; 
    
    hudStateGPS.current.opacity = THREE.MathUtils.lerp(hudStateGPS.current.opacity, targetHudOpacityGPS, 0.05);
    hudStateGPS.current.scale = THREE.MathUtils.lerp(hudStateGPS.current.scale, targetHudScaleGPS, 0.05);

    if (hudRefGPS.current) {
      hudRefGPS.current.style.opacity = hudStateGPS.current.opacity.toString();
      hudRefGPS.current.style.transform = `scale(${hudStateGPS.current.scale})`;
      hudRefGPS.current.style.pointerEvents = hudStateGPS.current.opacity > 0.1 ? 'auto' : 'none';
    }

    // --- PHYSICS FADE FOR VISION AI HOLOGRAPHIC HUD ---
    const targetHudOpacityAI = (!isMobile && progress >= 0.72 && progress <= 0.86) ? 1 : 0;
    const targetHudScaleAI = (!isMobile && progress >= 0.72 && progress <= 0.86) ? 0.9 : 0.7;
    
    hudStateAI.current.opacity = THREE.MathUtils.lerp(hudStateAI.current.opacity, targetHudOpacityAI, 0.05);
    hudStateAI.current.scale = THREE.MathUtils.lerp(hudStateAI.current.scale, targetHudScaleAI, 0.05);

    if (hudRefAI.current) {
      hudRefAI.current.style.opacity = hudStateAI.current.opacity.toString();
      hudRefAI.current.style.transform = `scale(${hudStateAI.current.scale})`;
      hudRefAI.current.style.pointerEvents = hudStateAI.current.opacity > 0.1 ? 'auto' : 'none';
    }

    let targetX = 0, targetY = 0, targetZ = 0;
    let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
    let targetScale = 1;

    if (isMobile) {
      // MOBILE SIMPLIFIED ANIMATION
      targetX = 0;
      targetY = -1.0; 
      targetZ = -4.0; 
      targetScale = 1.0;
      
      targetRotX = 0.2;
      targetRotY = progress * Math.PI * 2; 
      targetRotZ = 0;

      if (progress > 0.95) {
         const p = (progress - 0.95) / 0.05;
         targetY = THREE.MathUtils.lerp(-1.0, 5, p);
         targetZ = THREE.MathUtils.lerp(-4.0, -10, p);
      }
    } else {
      // DESKTOP COMPLEX ANIMATION
      if (progress < 0.02) {
        // HERO
        targetX = 1.5; targetY = 0.5; targetZ = 1;
        targetRotX = 0.3; targetRotY = -Math.PI / 5; targetRotZ = 0.35;
        targetScale = 2.0;
      } else if (progress < 0.10) {
        const p = (progress - 0.02) / 0.08;
        targetX = THREE.MathUtils.lerp(1.5, 2.5, p);
        targetY = THREE.MathUtils.lerp(0.5, 0.5, p);
        targetZ = THREE.MathUtils.lerp(1, 0, p);
        targetRotX = THREE.MathUtils.lerp(0.3, 0.1, p);
        targetRotY = THREE.MathUtils.lerp(-Math.PI / 5, -Math.PI / 4, p);
        targetRotZ = THREE.MathUtils.lerp(0.35, 0.1, p);
        targetScale = THREE.MathUtils.lerp(2.0, 1.5, p);
      } else if (progress < 0.18) {
        const p = (progress - 0.10) / 0.08;
        targetX = THREE.MathUtils.lerp(2.5, -2.5, p);
        targetY = THREE.MathUtils.lerp(0.5, 0, p);
        targetZ = THREE.MathUtils.lerp(0, 1, p);
        targetRotX = THREE.MathUtils.lerp(0.1, 0, p);
        targetRotY = THREE.MathUtils.lerp(-Math.PI / 4, Math.PI / 4, p);
        targetRotZ = THREE.MathUtils.lerp(0.1, -0.4, p);
        targetScale = THREE.MathUtils.lerp(1.5, 1.8, p);
      } else if (progress < 0.25) {
        const p = (progress - 0.18) / 0.07;
        targetX = THREE.MathUtils.lerp(-2.5, 0, p);
        targetY = THREE.MathUtils.lerp(0, 3, p);
        targetZ = THREE.MathUtils.lerp(1, -2, p);
        targetRotX = THREE.MathUtils.lerp(0, -0.2, p);
        targetRotY = THREE.MathUtils.lerp(Math.PI / 4, 0, p);
        targetRotZ = THREE.MathUtils.lerp(-0.4, 0.5, p);
        targetScale = THREE.MathUtils.lerp(1.8, 1.0, p);
      } else if (progress < 0.40) {
        // TRACTION
        const p = (progress - 0.25) / 0.15;
        targetX = THREE.MathUtils.lerp(0, 0, p);
        targetY = THREE.MathUtils.lerp(3, 0, p); 
        targetZ = THREE.MathUtils.lerp(-2, -3, p); 
        targetRotX = THREE.MathUtils.lerp(-0.2, 0.2, p); 
        targetRotY = THREE.MathUtils.lerp(0, 0, p); 
        targetRotZ = THREE.MathUtils.lerp(0.5, 0, p); 
        targetScale = THREE.MathUtils.lerp(1.0, 1.5, p);
      } else if (progress < 0.52) {
        // BRIDGE
        const p = (progress - 0.40) / 0.12;
        targetX = THREE.MathUtils.lerp(0, 0, p);
        targetY = THREE.MathUtils.lerp(0, -1, p); 
        targetZ = THREE.MathUtils.lerp(-3, 2, p); 
        targetRotX = THREE.MathUtils.lerp(0.2, 0.1, p); 
        targetRotY = THREE.MathUtils.lerp(0, 0, p); 
        targetRotZ = THREE.MathUtils.lerp(0, 0, p); 
        targetScale = THREE.MathUtils.lerp(1.5, 2.5, p); 
      } else if (progress < 0.66) {
        // GPS
        const p = (progress - 0.52) / 0.14;
        targetX = THREE.MathUtils.lerp(0, -1.5, p);
        targetY = THREE.MathUtils.lerp(-1, 0, p);
        targetZ = THREE.MathUtils.lerp(2, -1, p);
        targetRotX = THREE.MathUtils.lerp(0.1, 0.05, p);
        targetRotY = THREE.MathUtils.lerp(0, Math.PI / 8, p); 
        targetRotZ = THREE.MathUtils.lerp(0, -0.05, p);
        targetScale = THREE.MathUtils.lerp(2.5, 1.3, p);
      } else if (progress < 0.84) {
        // VISION
        const p = (progress - 0.66) / 0.18;
        targetX = THREE.MathUtils.lerp(-1.5, 1.5, p); 
        targetY = THREE.MathUtils.lerp(0, 0, p);
        targetZ = THREE.MathUtils.lerp(-1, -1, p);
        targetRotX = THREE.MathUtils.lerp(0.05, 0.05, p);
        targetRotY = THREE.MathUtils.lerp(Math.PI / 8, -Math.PI / 8, p); 
        targetRotZ = THREE.MathUtils.lerp(-0.05, Math.PI * 2, p); 
        targetScale = THREE.MathUtils.lerp(1.3, 1.3, p);
      } else if (progress < 0.95) {
        // DOCKING
        const p = (progress - 0.84) / 0.11;
        targetX = THREE.MathUtils.lerp(1.5, -1.5, p);
        targetY = THREE.MathUtils.lerp(0, -2, p);
        targetZ = THREE.MathUtils.lerp(-1, 0, p);
        targetRotX = THREE.MathUtils.lerp(0.05, -Math.PI / 6, p);
        targetRotY = THREE.MathUtils.lerp(-Math.PI / 8, Math.PI / 4, p);
        targetRotZ = THREE.MathUtils.lerp(Math.PI * 2, 0, p);
        targetScale = THREE.MathUtils.lerp(1.3, 1.0, p);
      } else {
        // FLY AWAY
        const p = (progress - 0.95) / 0.05;
        targetX = THREE.MathUtils.lerp(-1.5, 0, p);
        targetY = THREE.MathUtils.lerp(-2, 5, p);
        targetZ = THREE.MathUtils.lerp(0, -10, p);
        targetRotX = THREE.MathUtils.lerp(-Math.PI / 6, -0.5, p);
        targetRotY = THREE.MathUtils.lerp(Math.PI / 4, 0, p);
        targetRotZ = 0;
        targetScale = THREE.MathUtils.lerp(1.0, 0.5, p);
      }
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
    
    droneRef.current.rotation.x = THREE.MathUtils.lerp(droneRef.current.rotation.x, targetRotX, 0.05);
    droneRef.current.rotation.y = THREE.MathUtils.lerp(droneRef.current.rotation.y, targetRotY, 0.05);
    droneRef.current.rotation.z = THREE.MathUtils.lerp(droneRef.current.rotation.z, targetRotZ, 0.05);
    
    groupRef.current.scale.set(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05),
      THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.05),
      THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.05)
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <DroneModel ref={droneRef} />
        
        {/* --- GPS HOLOGRAM (RIGHT) --- */}
        <Html 
          transform 
          position={[2.0, 0.2, 0]} 
          rotation={[0, -Math.PI / 8, 0]} 
          scale={0.4}
        >
          <div 
            ref={hudRefGPS}
            className="w-[400px] h-[260px] rounded-3xl bg-black/60 border border-red-500/30 p-1.5 shadow-[0_0_60px_rgba(239,68,68,0.2)] backdrop-blur-xl"
            style={{ opacity: 0, transform: 'scale(0.8)' }}
          >
             <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                   <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                   <span className="font-mono text-[8px] text-white uppercase tracking-widest font-bold">Encrypted Telemetry</span>
                </div>
                
                <img src="/images/planner.jpeg" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 scale-105" />
                
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent z-10">
                   <div className="flex justify-between items-end">
                     <div className="flex flex-col gap-0.5">
                       <span className="font-mono text-[7px] text-white/50 uppercase tracking-widest">Target Coordinates</span>
                       <span className="font-mono text-[10px] text-white font-bold">28°36'50"N 77°12'32"E</span>
                     </div>
                     <div className="text-right">
                       <span className="font-mono text-[7px] text-white/50 uppercase tracking-widest block">Alt</span>
                       <span className="font-mono text-[10px] text-white font-bold block">4,200ft</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </Html>

        {/* --- VISION AI HOLOGRAM (LEFT) --- */}
        <Html 
          transform 
          position={[-2.0, 0.2, 0]} 
          rotation={[0, Math.PI / 8, 0]} 
          scale={0.4}
        >
          <div 
            ref={hudRefAI}
            className="w-[400px] h-[260px] rounded-3xl bg-black/60 border border-blue-400/30 p-1.5 shadow-[0_0_60px_rgba(96,165,250,0.2)] backdrop-blur-xl"
            style={{ opacity: 0, transform: 'scale(0.8)' }}
          >
             <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                   <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                   <span className="font-mono text-[8px] text-white uppercase tracking-widest font-bold">AI Threat Detection</span>
                </div>
                
                <img src="/images/vision-applied.jpeg" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 scale-105" />
                
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent z-10">
                   <div className="flex justify-between items-end">
                     <div className="flex flex-col gap-0.5">
                       <span className="font-mono text-[7px] text-white/50 uppercase tracking-widest">Confidence</span>
                       <span className="font-mono text-[10px] text-blue-400 font-bold">98.4% Match</span>
                     </div>
                     <div className="text-right flex items-center gap-1">
                       <span className="font-mono text-[7px] text-white/50 uppercase tracking-widest border border-white/20 px-1 py-0.5 rounded-sm bg-white/5">PERSONNEL</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] h-screen w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <spotLight position={[-10, 10, 10]} intensity={2.5} color="#E8202A" angle={0.5} penumbra={1} />
        <spotLight position={[10, -10, -10]} intensity={1} color="#00FF88" angle={0.5} penumbra={1} />
        
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <DroneController />
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.6}
            scale={15}
            blur={2}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
