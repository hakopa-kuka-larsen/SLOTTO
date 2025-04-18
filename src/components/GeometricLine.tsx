import React from 'react'
import { Line, LineBasicMaterial, BufferGeometry, Vector3 } from 'three'

interface GeometricLineProps {
  position?: [number, number, number]
  length?: number
  segments?: number
  color?: string
  lineWidth?: number
  animationSpeed?: number
}

/**
 * A purple geometric line that follows the x-axis
 */
const GeometricLine: React.FC<GeometricLineProps> = ({
  position = [0, 0, 0],
  length = 10,
  segments = 20,
  color = '#8A2BE2', // Purple color
  lineWidth = 2,
  animationSpeed = 1,
}) => {
  // Create points for the line
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * length - length / 2
    points.push(new Vector3(x, 0, 0))
  }

  // Create geometry and material
  const geometry = new BufferGeometry().setFromPoints(points)
  const material = new LineBasicMaterial({
    color: color,
    linewidth: lineWidth,
  })

  return <primitive object={new Line(geometry, material)} position={position} />
}

export default GeometricLine
