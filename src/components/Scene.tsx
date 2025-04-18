import { ReactNode } from 'react'
import { LIGHTING } from '../utils/constants'

interface SceneProps {
  children: ReactNode
}

export const Scene = ({ children }: SceneProps) => {
  return (
    <>
      {/* Ambient lighting for overall scene illumination */}
      <ambientLight intensity={LIGHTING.AMBIENT.intensity} />

      {/* Point lights for dynamic lighting effects */}
      {LIGHTING.POINT.map((light, index) => (
        <pointLight
          key={`point-light-${index}`}
          position={light.position}
          intensity={light.intensity}
          distance={light.distance}
          decay={light.decay}
        />
      ))}

      {/* Directional lights for shadows and highlights */}
      {LIGHTING.DIRECTIONAL.map((light, index) => (
        <directionalLight
          key={`directional-light-${index}`}
          position={light.position}
          intensity={light.intensity}
          castShadow={light.castShadow}
        />
      ))}

      {children}
    </>
  )
}
