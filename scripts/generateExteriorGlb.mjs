import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const output = resolve('static/models/exterior/house-exterior.glb')

const materials = [
  { name: 'Concrete', color: [0.77, 0.76, 0.72, 1], roughness: 0.86, metallic: 0 },
  { name: 'White render', color: [0.92, 0.92, 0.89, 1], roughness: 0.68, metallic: 0 },
  { name: 'Dark glass', color: [0.035, 0.07, 0.09, 1], roughness: 0.18, metallic: 0.08 },
  { name: 'Warm timber', color: [0.34, 0.18, 0.09, 1], roughness: 0.58, metallic: 0 },
  { name: 'Black metal', color: [0.025, 0.028, 0.03, 1], roughness: 0.32, metallic: 0.8 },
]

const boxes = [
  // Envelope-defining volumes. Their union is exactly 10.8 × 9.6 × 6.9 m.
  ['Lower concrete shell', [0, 1.55, -0.5], [10.8, 3.1, 8.6], 0],
  ['Upper white shell', [0, 4.65, 0], [10.8, 3.1, 9.6], 1],
  ['Roof parapet', [0, 6.55, 0], [10.8, 0.7, 9.6], 1],

  // Recessed façade planes keep the canonical bounds unchanged.
  ['North lower glazing', [-3.15, 1.55, 3.806], [3.7, 2.15, 0.08], 2],
  ['North lower door', [1.45, 1.42, 3.806], [1.45, 2.42, 0.08], 3],
  ['North upper glazing A', [-2.65, 4.72, 4.756], [2.9, 1.78, 0.08], 2],
  ['North upper glazing B', [1.15, 4.72, 4.756], [2.65, 1.92, 0.08], 2],
  ['West lower glazing', [-5.356, 1.55, 1.9], [0.08, 2.15, 3.55], 2],
  ['West upper glazing', [-5.356, 4.72, 0.85], [0.08, 1.78, 2.3], 2],

  // Architectural accents.
  ['North canopy', [1.45, 2.85, 4.03], [2.2, 0.14, 1.12], 4],
  ['North balcony slab', [-2.55, 3.25, 4.27], [4.25, 0.18, 0.92], 0],
  ['Balcony rail', [-2.55, 3.72, 4.68], [4.25, 0.78, 0.055], 4],
  ['East vertical screen', [5.356, 3.15, 0.8], [0.08, 4.9, 2.4], 3],
]

const faces = [
  { n: [1, 0, 0], c: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
  { n: [-1, 0, 0], c: [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]] },
  { n: [0, 1, 0], c: [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]] },
  { n: [0, -1, 0], c: [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]] },
  { n: [0, 0, 1], c: [[1, -1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1]] },
  { n: [0, 0, -1], c: [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]] },
]

const positions = []
const normals = []
const indices = []

for (const [, center, size] of boxes) {
  let localVertex = 0

  for (const face of faces) {
    const faceStart = localVertex

    for (const corner of face.c) {
      positions.push(
        center[0] + corner[0] * size[0] / 2,
        center[1] + corner[1] * size[1] / 2,
        center[2] + corner[2] * size[2] / 2,
      )
      normals.push(...face.n)
      localVertex += 1
    }

    indices.push(
      faceStart,
      faceStart + 1,
      faceStart + 2,
      faceStart,
      faceStart + 2,
      faceStart + 3,
    )
  }
}

const posData = Buffer.from(new Float32Array(positions).buffer)
const normalData = Buffer.from(new Float32Array(normals).buffer)
const indexData = Buffer.from(new Uint16Array(indices).buffer)
const align4 = (value) => (value + 3) & ~3
const posOffset = 0
const normalOffset = align4(posData.length)
const indexOffset = align4(normalOffset + normalData.length)
const binLength = align4(indexOffset + indexData.length)
const bin = Buffer.alloc(binLength)
posData.copy(bin, posOffset)
normalData.copy(bin, normalOffset)
indexData.copy(bin, indexOffset)

const gltf = {
  asset: { version: '2.0', generator: 'DESWEB3D exterior generator' },
  scene: 0,
  scenes: [{ nodes: boxes.map((_, index) => index) }],
  nodes: boxes.map(([name], index) => ({ name, mesh: index })),
  meshes: boxes.map(([name, , , material], index) => ({
    name,
    primitives: [{
      attributes: { POSITION: index * 2, NORMAL: index * 2 + 1 },
      indices: index * 3 + 2,
      material,
      mode: 4,
    }],
  })),
  materials: materials.map((material) => ({
    name: material.name,
    pbrMetallicRoughness: {
      baseColorFactor: material.color,
      roughnessFactor: material.roughness,
      metallicFactor: material.metallic,
    },
  })),
  buffers: [{ byteLength: bin.length }],
  bufferViews: [],
  accessors: [],
}

for (let index = 0; index < boxes.length; index += 1) {
  const vertexOffset = index * 24
  const indexStart = index * 36
  const positionByteOffset = posOffset + vertexOffset * 12
  const normalByteOffset = normalOffset + vertexOffset * 12
  const indexByteOffset = indexOffset + indexStart * 2
  const [, center, size] = boxes[index]

  gltf.bufferViews.push(
    { buffer: 0, byteOffset: positionByteOffset, byteLength: 24 * 12, target: 34962 },
    { buffer: 0, byteOffset: normalByteOffset, byteLength: 24 * 12, target: 34962 },
    { buffer: 0, byteOffset: indexByteOffset, byteLength: 36 * 2, target: 34963 },
  )

  gltf.accessors.push(
    {
      bufferView: index * 3,
      componentType: 5126,
      count: 24,
      type: 'VEC3',
      min: center.map((value, axis) => value - size[axis] / 2),
      max: center.map((value, axis) => value + size[axis] / 2),
    },
    {
      bufferView: index * 3 + 1,
      componentType: 5126,
      count: 24,
      type: 'VEC3',
    },
    {
      bufferView: index * 3 + 2,
      componentType: 5123,
      count: 36,
      type: 'SCALAR',
      min: [0],
      max: [23],
    },
  )
}

const jsonSource = JSON.stringify(gltf)
const jsonLength = align4(Buffer.byteLength(jsonSource))
const json = Buffer.alloc(jsonLength, 0x20)
json.write(jsonSource)

const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8)

const jsonHeader = Buffer.alloc(8)
jsonHeader.writeUInt32LE(json.length, 0)
jsonHeader.writeUInt32LE(0x4e4f534a, 4)

const binHeader = Buffer.alloc(8)
binHeader.writeUInt32LE(bin.length, 0)
binHeader.writeUInt32LE(0x004e4942, 4)

await mkdir(dirname(output), { recursive: true })
await writeFile(output, Buffer.concat([header, jsonHeader, json, binHeader, bin]))
console.log(`Generated ${output}`)
