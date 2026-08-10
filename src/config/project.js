export const PROJECT = Object.freeze({
  runtime: {
    useApprovedExteriorModel: false,
  },
  coordinates: {
    glbContract: {
      upAxis: 'Y',
      northAxis: '+Z',
      eastAxis: '+X',
      origin: 'building-footprint-center-at-ground-level',
      metersPerUnit: 1,
    },
  },
  dimensions: {
    platform: { width: 16, depth: 16, thickness: 0.2 },
    building: {
      maxWidth: 10.8,
      maxDepth: 9.6,
      floorToFloor: 3.1,
      targetHeight: 6.9,
      lower: {
        width: 10.8,
        depth: 8.6,
        centerDepth: -0.5,
      },
      upper: {
        width: 10.8,
        depth: 9.6,
        centerDepth: 0,
      },
      parapetHeight: 0.7,
    },
  },
  validation: {
    exteriorModelTolerance: {
      width: 0.25,
      depth: 0.25,
      height: 0.25,
      ground: 0.05,
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
  },
})
