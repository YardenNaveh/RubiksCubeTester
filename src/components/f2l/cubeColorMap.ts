import { CubeColor } from '../../logic/cubeConstants';

// Define standard cube colors mapping to hex
export const CUBE_COLOR_MAP: Record<CubeColor | 'black' | 'highlight', string> = {
  white: '#FFFFFF',
  yellow: '#FFFF00',
  green: '#00FF00',
  blue: '#0000FF',
  red: '#FF0000',
  orange: '#FFA500',
  black: '#1A1A1A', // Very dark gray for solved, not pure black
  highlight: '#7e4dc1', // Purple highlight color
}; 