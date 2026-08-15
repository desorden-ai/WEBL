import * as THREE from 'three';
import { CameraViewId } from '../types';
import { CAMERA_VIEWS } from '../data/config';

// Ultra-smooth quintic easing for fluid, stabilized filmic camera motion (zero jerk at t=0 and t=1)
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeInOutQuint(x: number): number {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

// Compute an optimized 3D bezier control point between any two viewpoints or positions
// to ensure seamless gliding without clipping walls, trees, or stepping backwards.
export function getBezierControlPoint(
  fromId: CameraViewId,
  toId: CameraViewId,
  currentPos?: THREE.Vector3,
  targetPos?: THREE.Vector3
): THREE.Vector3 {
  const p1 = currentPos || new THREE.Vector3(CAMERA_VIEWS[fromId].pos.x, CAMERA_VIEWS[fromId].pos.y, CAMERA_VIEWS[fromId].pos.z);
  const p2 = targetPos || new THREE.Vector3(CAMERA_VIEWS[toId].pos.x, CAMERA_VIEWS[toId].pos.y, CAMERA_VIEWS[toId].pos.z);

  const mid = new THREE.Vector3(
    (p1.x + p2.x) * 0.5,
    (p1.y + p2.y) * 0.5,
    (p1.z + p2.z) * 0.5
  );

  const pair = `${fromId}->${toId}`;

  if (pair === 'general->interior' || pair === 'interior->general') {
    // Direct fluid glide straight through the glazed deck into the living room at eye level
    mid.x = p1.x * 0.25 + p2.x * 0.75;
    mid.y = 6.42;
    mid.z = p1.z * 0.35 + p2.z * 0.65;
  } else if (pair === 'interior->livingCorner' || pair === 'livingCorner->interior') {
    // Smooth internal traversal across the living room avoiding obstacles
    mid.x = (p1.x + p2.x) * 0.5;
    mid.y = 6.36;
    mid.z = Math.max(p1.z, p2.z) * 0.5 + 0.2;
  } else if (pair === 'general->livingCorner' || pair === 'livingCorner->general') {
    // Direct fluid trajectory through the wide frontal glass facade
    mid.x = p1.x * 0.35 + p2.x * 0.65;
    mid.y = 6.42;
    mid.z = p1.z * 0.40 + p2.z * 0.60;
  } else if (pair === 'interior->lateral' || pair === 'lateral->interior' || pair === 'livingCorner->lateral' || pair === 'lateral->livingCorner') {
    // Smooth wide arc clearing the glass corner and terrace frame
    mid.x = Math.max(p1.x, p2.x) * 0.55 + 2.0;
    mid.y = 6.45;
    mid.z = Math.max(p1.z, p2.z) * 0.65 + 1.0;
  } else if (pair === 'lowAngle->interior' || pair === 'interior->lowAngle' || pair === 'lowAngle->livingCorner' || pair === 'livingCorner->lowAngle') {
    // Ascend cleanly towards the deck level before entering living room
    mid.x = (p1.x + p2.x) * 0.5 + 0.5;
    mid.y = 6.1;
    mid.z = (p1.z + p2.z) * 0.5 + 1.0;
  } else if (pair === 'lateral->lowAngle' || pair === 'lowAngle->lateral') {
    mid.x = (p1.x + p2.x) * 0.5 + 1.5;
    mid.y = Math.max(p1.y, p2.y) + 0.6;
    mid.z = (p1.z + p2.z) * 0.5 + 2.0;
  } else if (pair === 'lowAngle->general' || pair === 'general->lowAngle') {
    mid.x = (p1.x + p2.x) * 0.5;
    mid.y = Math.max(p1.y, p2.y) + 0.5;
    mid.z = (p1.z + p2.z) * 0.5 + 1.0;
  } else if (pair === 'general->lateral' || pair === 'lateral->general') {
    // Elegant sweeping arc around the perimeter of the pine clearing
    mid.x = (p1.x + p2.x) * 0.5 + 3.0;
    mid.y = (p1.y + p2.y) * 0.5 + 0.4;
    mid.z = Math.max(p1.z, p2.z) + 1.5;
  } else {
    mid.y = Math.max(p1.y, p2.y) + 0.4;
  }

  return mid;
}

// Quadratic Bezier interpolation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
export function sampleBezierCurve(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const clampedT = Math.max(0, Math.min(1, t));
  const oneMinusT = 1 - clampedT;
  const a = oneMinusT * oneMinusT;
  const b = 2 * oneMinusT * clampedT;
  const c = clampedT * clampedT;

  return new THREE.Vector3(
    a * p0.x + b * p1.x + c * p2.x,
    a * p0.y + b * p1.y + c * p2.y,
    a * p0.z + b * p1.z + c * p2.z
  );
}
