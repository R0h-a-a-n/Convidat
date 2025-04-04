"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"

/** 
 * Globe default configuration 
 * Adjust `theta`, `phi`, etc. to change the initial tilt/orientation.
 */
const GLOBE_CONFIG: COBEOptions = {
    width: 1000,
    height: 1000,
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [1, 1, 1],
    markerColor: [251 / 255, 100 / 255, 21 / 255],
    glowColor: [1, 1, 1],
    markers: [
      { location: [14.5995, 120.9842], size: 0.03 },
      { location: [19.076, 72.8777], size: 0.1 },
      { location: [23.8103, 90.4125], size: 0.05 },
      { location: [30.0444, 31.2357], size: 0.07 },
      { location: [39.9042, 116.4074], size: 0.08 },
      { location: [-23.5505, -46.6333], size: 0.1 },
      { location: [19.4326, -99.1332], size: 0.1 },
      { location: [40.7128, -74.006], size: 0.1 },
      { location: [34.6937, 135.5022], size: 0.05 },
      { location: [41.0082, 28.9784], size: 0.06 },
    ],
    onRender: () => {} // 👈 placeholder to satisfy TS
  }
  

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Used for drag/interaction
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      // Spin the globe if not dragging
      if (!pointerInteracting.current) phi += 0.003
      state.phi = phi + r
      state.width = width
      state.height = width
    },
    [r]
  )

  const onResize = () => {
    if (canvasRef.current) {
      const bounds = canvasRef.current.getBoundingClientRect();
      width = Math.min(bounds.width, 900); // cap width for better performance
    }
  }
  

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width,  // match container width
      height: width,
      onRender,
    })

    // Fade in the globe once initialized
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [config, onRender])

  return (
    /**
     * This container stretches over the entire screen (inset-0) and 
     * uses flex to center its contents horizontally and vertically.
     */
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[900px] max-h-[900px] pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-0 transition-opacity duration-500"
          onPointerDown={(e) =>
            updatePointerInteraction(
              e.clientX - pointerInteractionMovement.current
            )
          }
          onPointerUp={() => updatePointerInteraction(null)}
          onPointerOut={() => updatePointerInteraction(null)}
          onMouseMove={(e) => updateMovement(e.clientX)}
          onTouchMove={(e) =>
            e.touches[0] && updateMovement(e.touches[0].clientX)
          }
        />
      </div>
    </div>
  )
}
