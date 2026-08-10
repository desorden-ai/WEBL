# DESWEB3D — GLB CONTRACT

## Purpose

This contract defines the exact assumptions that any approved exterior `.glb` must satisfy before `WEBL/SOL` can activate it in the viewer.

Drive `DESWEB3D` remains the production source of truth. This file is the runtime integration contract.

## 1. Coordinate systems

### Architectural source convention

- `X`: West → East
- `Y`: South → North
- `Z`: height

### Three.js runtime convention

- `X`: West → East
- `Y`: height
- `Z`: South → North

### Required GLB convention

The exported GLB must already be **Y-up** and must enter Three.js without a corrective rotation:

- `+X` = East
- `+Y` = Up
- `+Z` = North
- `-X` = West
- `-Z` = South

Do not rely on viewer-side rotation to repair an incorrectly exported asset.

## 2. Units

- `1 GLB unit = 1 meter`.
- No runtime scale multiplier should be required.
- Export transforms should be applied/frozen before delivery when the authoring tool supports it.

## 3. Origin / pivot

Required origin:

`building-footprint-center-at-ground-level`

That means:

- horizontal origin is the center of the approved building footprint;
- vertical origin is the finished ground/floor reference `0.00 m`;
- the model should have a bounding-box minimum `Y` close to `0`.

The viewer positions the model on top of the concrete platform. The GLB itself must not include an arbitrary vertical offset.

## 4. Provisional dimensional envelope

Current integration envelope:

- max width X: `10.80 m`;
- max depth Z: `9.60 m`;
- target total height Y: `6.90 m`;
- platform: `16.00 × 16.00 × 0.20 m`.

Current validation tolerance in `src/config/project.js`:

- width: ±0.25 m;
- depth: ±0.25 m;
- height: ±0.25 m.

These values are provisional until architectural geometry is frozen.

## 5. Geometry status

Current P0/P1 status:

- P0 V0.3: provisional geometric base accepted;
- P1 V0.1: provisional volumetric scaffold accepted;
- North and West are the best-observed façades;
- South and East remain `PROPOSAL`;
- the 1.00 m North overhang is `DEDUCED`, not contractual.

A GLB must not silently convert proposals/deductions into approved facts.

## 6. Materials

Runtime-compatible expectations:

- glTF 2.0 / GLB;
- PBR metallic-roughness workflow where practical;
- textures referenced correctly or embedded intentionally;
- no broken local authoring-tool paths;
- dark glazing, light upper volume, warm lower material language remain consistent with the master reference.

Final texture resolution/compression policy is a later approval step.

## 7. Mesh behavior

On load, the viewer enables `castShadow` and `receiveShadow` on mesh nodes.

The model should avoid:

- hidden duplicate geometry;
- accidental high-poly construction helpers;
- cameras/lights that are required for correct appearance;
- huge empty transforms expanding the bounds;
- geometry located far from origin.

## 8. Runtime integration

Expected file location:

`static/models/exterior/house-exterior.glb`

Runtime URL:

`/models/exterior/house-exterior.glb`

Activation flag:

`PROJECT.runtime.useApprovedExteriorModel`

The flag stays `false` until the GLB passes review.

## 9. Runtime validation

`ExteriorGLB.jsx` measures the loaded scene with `THREE.Box3` and checks:

- width (`X`);
- depth (`Z`);
- height (`Y`);
- ground alignment (`minY ≈ 0`).

Contract mismatches throw an `ExteriorValidationError` before the asset is rendered. The measured and expected bounds plus the coordinate contract remain attached to the error for diagnostics. `ViewerErrorBoundary` then replaces the viewer with its recoverable error state.

A mismatch is therefore a failed asset review at runtime, not a warning and not something corrected by arbitrary viewer scaling.

## 10. Acceptance checklist

A candidate exterior GLB is accepted only when:

- [ ] geometry matches the approved architectural revision;
- [ ] 1 unit = 1 meter;
- [ ] Y-up;
- [ ] +Z = North;
- [ ] +X = East;
- [ ] origin is footprint-center at ground level;
- [ ] bounds are within the approved envelope/tolerance;
- [ ] no broken texture references;
- [ ] no accidental authoring helpers;
- [ ] acceptable mobile complexity;
- [ ] visual comparison against master reference passes;
- [ ] orbit viewer shows all façades correctly;
- [ ] model loads without runtime errors;
- [ ] blockout can be restored immediately if the asset fails.
