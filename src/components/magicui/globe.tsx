import createGlobe, { type COBEOptions } from 'cobe';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, type CSSProperties } from 'react';

const MOVEMENT_DAMPING = 1400;

// Navy base with teal markers/glow — tuned to the Super Capital palette,
// with a focus on India plus a handful of global financial hubs.
export const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.32,
  dark: 1,
  diffuse: 0.6,
  mapSamples: 16000,
  mapBrightness: 5,
  baseColor: [0.06, 0.18, 0.35],
  markerColor: [0.16, 0.72, 0.68],
  glowColor: [0.06, 0.43, 0.42],
  markers: [
    { location: [19.076, 72.8777], size: 0.09 },   // Mumbai
    { location: [28.7041, 77.1025], size: 0.07 },  // Delhi
    { location: [12.9716, 77.5946], size: 0.06 },  // Bengaluru
    { location: [23.2156, 72.6369], size: 0.06 },  // Gandhinagar
    { location: [22.5726, 88.3639], size: 0.05 },  // Kolkata
    { location: [13.0827, 80.2707], size: 0.05 },  // Chennai
    { location: [1.3521, 103.8198], size: 0.06 },  // Singapore
    { location: [25.2048, 55.2708], size: 0.05 },  // Dubai
    { location: [51.5074, -0.1278], size: 0.05 },  // London
    { location: [40.7128, -74.006], size: 0.05 },  // New York
  ],
};

export function Globe({
  className,
  style,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  style?: CSSProperties;
  config?: COBEOptions;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab';
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (pointerInteracting.current === null) phiRef.current += 0.005;
        state.phi = phiRef.current + rs.get();
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    }, 0);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rs, config]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        margin: '0 auto',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: 600,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'grab',
          transition: 'opacity 0.5s ease',
          contain: 'layout paint size',
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}
