import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const MODEL_PATH = new URL('../static/models/exterior/house-exterior.glb', import.meta.url)
const GLB_MAGIC = 0x46546c67
const JSON_CHUNK = 0x4e4f534a
const BIN_CHUNK = 0x004e4942

function parseGlb(buffer) {
  assert.ok(buffer.length >= 20, 'GLB is too small')
  assert.equal(buffer.readUInt32LE(0), GLB_MAGIC, 'invalid GLB magic')
  assert.equal(buffer.readUInt32LE(4), 2, 'GLB must use glTF 2.0')
  assert.equal(buffer.readUInt32LE(8), buffer.length, 'GLB header length must match file length')

  const jsonLength = buffer.readUInt32LE(12)
  assert.equal(buffer.readUInt32LE(16), JSON_CHUNK, 'first GLB chunk must be JSON')

  const jsonStart = 20
  const jsonEnd = jsonStart + jsonLength
  const gltf = JSON.parse(buffer.subarray(jsonStart, jsonEnd).toString('utf8').trim())

  const binHeader = jsonEnd
  assert.ok(binHeader + 8 <= buffer.length, 'GLB is missing BIN chunk header')
  const binLength = buffer.readUInt32LE(binHeader)
  assert.equal(buffer.readUInt32LE(binHeader + 4), BIN_CHUNK, 'second GLB chunk must be BIN')

  const binStart = binHeader + 8
  const binEnd = binStart + binLength
  assert.ok(binEnd <= buffer.length, 'BIN chunk exceeds GLB file length')

  return { gltf, bin: buffer.subarray(binStart, binEnd) }
}

function readUnsignedScalarAccessor(gltf, bin, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex]
  assert.equal(accessor.type, 'SCALAR', `accessor ${accessorIndex} must be SCALAR`)

  const view = gltf.bufferViews[accessor.bufferView]
  const accessorOffset = accessor.byteOffset ?? 0
  const start = (view.byteOffset ?? 0) + accessorOffset

  const readers = {
    5121: { bytes: 1, read: (offset) => bin.readUInt8(offset) },
    5123: { bytes: 2, read: (offset) => bin.readUInt16LE(offset) },
    5125: { bytes: 4, read: (offset) => bin.readUInt32LE(offset) },
  }
  const reader = readers[accessor.componentType]
  assert.ok(reader, `unsupported index component type ${accessor.componentType}`)

  const requiredEnd = start + accessor.count * reader.bytes
  assert.ok(requiredEnd <= bin.length, `accessor ${accessorIndex} exceeds BIN chunk`)

  return Array.from({ length: accessor.count }, (_, index) =>
    reader.read(start + index * reader.bytes),
  )
}

test('generated exterior GLB has valid primitive index ranges', async () => {
  const buffer = await readFile(MODEL_PATH)
  const { gltf, bin } = parseGlb(buffer)

  assert.ok(Array.isArray(gltf.meshes) && gltf.meshes.length > 0, 'GLB must contain meshes')

  for (const [meshIndex, mesh] of gltf.meshes.entries()) {
    for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
      const positionAccessor = gltf.accessors[primitive.attributes.POSITION]
      assert.ok(positionAccessor, `mesh ${meshIndex} primitive ${primitiveIndex} lacks POSITION accessor`)
      assert.ok(positionAccessor.count > 0, `mesh ${meshIndex} has no POSITION vertices`)

      const indices = readUnsignedScalarAccessor(gltf, bin, primitive.indices)
      const maxIndex = Math.max(...indices)
      const minIndex = Math.min(...indices)

      assert.ok(minIndex >= 0, `mesh ${meshIndex} has a negative index`)
      assert.ok(
        maxIndex < positionAccessor.count,
        `mesh ${meshIndex} primitive ${primitiveIndex} references vertex ${maxIndex}, but POSITION has ${positionAccessor.count} vertices`,
      )
    }
  }
})
