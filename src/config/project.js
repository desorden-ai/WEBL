export const PROJECT = Object.freeze({
  runtime: {
    useApprovedExteriorModel: false,
  },
  dimensions: {
    platform: { width: 16, depth: 16, thickness: 0.18 },
    building: {
      maxWidth: 10.8,
      maxDepth: 9.6,
      floorToFloor: 3.1,
      targetHeight: 6.9,
    },
  },
  camera: {
    initialPosition: [15, 11, 15],
    target: [0, 2.8, 0],
    fov: 38,
    near: 0.1,
    far: 150,
    minDistance: 11,
    maxDistance: 34,
    minPolarAngle: 0.38,
    maxPolarAngle: 1.48,
  },
  assets: {
    exteriorModel: '/models/exterior/house-exterior.glb',
    terrainModel: '/models/terrain/platform.glb',
    daylightHdri: '/environment/daylight.hdr',
  },
})
