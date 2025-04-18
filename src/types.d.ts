import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      ambientLight: any
      pointLight: any
      mesh: any
      boxGeometry: any
      cylinderGeometry: any
      planeGeometry: any
      sphereGeometry: any
      meshStandardMaterial: any
    }
  }
}
