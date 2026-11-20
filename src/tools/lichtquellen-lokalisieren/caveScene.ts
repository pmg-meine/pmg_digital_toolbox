import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { generateOpenings, type Opening, type OpeningSide } from "./openings";

type CameraMode = "orthographic" | "perspective";
interface OpeningEndpoints { center: THREE.Vector3; left: THREE.Vector3; right: THREE.Vector3 }
type SceneCamera = THREE.PerspectiveCamera | THREE.OrthographicCamera;
const cave = { width: 12, depth: 12, wallThickness: 0.04, wallHeight: 2.8 } as const;
const worldSize = 28;
const openingWidth = 1.5;
const beamLengthOutside = 8.5;

export function createCaveScene(canvas: HTMLCanvasElement, onSourceChange: (x: number, y: number) => void) {
const inputs = {
  lightX: { value: "0" }, lightY: { value: "1.4" }, lightZ: { value: "0" },
  holeCount: { value: "4" }, hideSource: { checked: false }, showInnerRays: { checked: true },
};
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const perspectiveCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const orthographicCamera = new THREE.OrthographicCamera(-12, 12, 12, -12, 0.1, 100);
orthographicCamera.up.set(0, 0, -1);
const cameraTarget = new THREE.Vector3(0, 0, 0);

let camera: SceneCamera = orthographicCamera;
let controls = createControls(camera);

scene.add(new THREE.AmbientLight(0xffffff, 1.1));

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(5, 12, 4);
scene.add(sunLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(worldSize, worldSize),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const innerFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(cave.width - 0.1, cave.depth - 0.1),
  new THREE.MeshStandardMaterial({
    color: 0xc4c4c4,
    roughness: 1,
    metalness: 0,
  }),
);
innerFloor.rotation.x = -Math.PI / 2;
innerFloor.position.y = 0.002;
scene.add(innerFloor);

const ringOutline = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.PlaneGeometry(cave.width, cave.depth)),
  new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.7 }),
);
ringOutline.rotation.x = -Math.PI / 2;
ringOutline.position.y = 0.01;
scene.add(ringOutline);

const wallGroup = new THREE.Group();
const beamGroup = new THREE.Group();
const openingMarkerGroup = new THREE.Group();
const interiorRayGroup = new THREE.Group();
scene.add(wallGroup);
scene.add(beamGroup);
scene.add(openingMarkerGroup);
scene.add(interiorRayGroup);

const sourceMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 24, 24),
  new THREE.MeshStandardMaterial({
    color: 0xa30c8f,
    roughness: 0.32,
  }),
);
scene.add(sourceMesh);

const sourceHalo = new THREE.Mesh(
  new THREE.RingGeometry(0.45, 0.7, 40),
  new THREE.MeshBasicMaterial({
    color: 0xa30c8f,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  }),
);
sourceHalo.rotation.x = -Math.PI / 2;
sourceHalo.position.y = 0.01;
scene.add(sourceHalo);

const sourceState = new THREE.Vector3(
  Number(inputs.lightX.value),
  Number(inputs.lightY.value),
  Number(inputs.lightZ.value),
);

let openingLayout = generateOpenings();
let openings: Opening[] = [];
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragIntersection = new THREE.Vector3();
let isDraggingSource = false;

function createControls(cameraObject: SceneCamera): OrbitControls {
  const nextControls = new OrbitControls(cameraObject, canvas);
  nextControls.enableDamping = true;
  nextControls.target.copy(cameraTarget);

  if (cameraObject instanceof THREE.OrthographicCamera) {
    nextControls.enableRotate = false;
    nextControls.screenSpacePanning = true;
    nextControls.minZoom = 0.8;
    nextControls.maxZoom = 2.4;
  } else {
    nextControls.enableRotate = true;
    nextControls.screenSpacePanning = false;
    nextControls.minDistance = 8;
    nextControls.maxDistance = 40;
    nextControls.maxPolarAngle = Math.PI / 2 - 0.08;
  }

  return nextControls;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clearGroup(group: THREE.Group): void {
  while (group.children.length > 0) {
    const child = group.children[group.children.length - 1];
    group.remove(child);

    const meshChild = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };

    meshChild.geometry?.dispose();

    if (Array.isArray(meshChild.material)) {
      meshChild.material.forEach((material) => material.dispose());
    } else {
      meshChild.material?.dispose();
    }
  }
}

function syncSourceInputs(): void {
  onSourceChange(sourceState.x, sourceState.z);
}

function updateReadout(): void {}

function setSourcePosition(x: number, z: number): void {
  sourceState.x = clamp(x, -4.2, 4.2);
  sourceState.z = clamp(z, -4.2, 4.2);
  syncSourceInputs();
  updateSource();
}

function updatePointer(event: PointerEvent): void {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function isPointerOverSource(event: PointerEvent): boolean {
  if (inputs.hideSource.checked) {
    return false;
  }

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects([sourceMesh, sourceHalo], false);
  return intersections.length > 0;
}

function dragSourceToPointer(event: PointerEvent): void {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  if (!raycaster.ray.intersectPlane(dragPlane, dragIntersection)) {
    return;
  }
  setSourcePosition(dragIntersection.x, dragIntersection.z);
}

function setCameraTopView(): void {
  cameraTarget.set(0, 0, 0);
  controls.target.copy(cameraTarget);

  camera.position.set(0, 24, 0.001);
  if (camera instanceof THREE.OrthographicCamera) {
    camera.zoom = 1;
  }

  camera.lookAt(cameraTarget);
  camera.updateProjectionMatrix();
  controls.update();
}

function resizeRenderer(): void {
  const viewport = canvas.parentElement;
  if (!viewport) {
    throw new Error("Canvas parent element is missing");
  }

  const bounds = viewport.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds.width));
  const height = Math.max(1, Math.floor(bounds.height));

  renderer.setSize(width, height, false);
  const aspect = width / height;

  perspectiveCamera.aspect = aspect;
  perspectiveCamera.updateProjectionMatrix();

  const viewSize = 13;
  orthographicCamera.left = -viewSize * aspect;
  orthographicCamera.right = viewSize * aspect;
  orthographicCamera.top = viewSize;
  orthographicCamera.bottom = -viewSize;
  orthographicCamera.updateProjectionMatrix();

  camera.updateProjectionMatrix();
}

function switchCamera(mode: CameraMode): void {
  const previousPosition = camera.position.clone();
  const previousTarget = controls.target.clone();

  controls.dispose();
  camera = mode === "perspective" ? perspectiveCamera : orthographicCamera;
  controls = createControls(camera);
  camera.position.copy(previousPosition);
  cameraTarget.copy(previousTarget);
  controls.target.copy(cameraTarget);
  controls.update();
  resizeRenderer();
}

function createWallSegment(width: number, depth: number, x: number, z: number): void {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, cave.wallHeight, depth),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.95,
      metalness: 0.02,
    }),
  );
  mesh.position.set(x, cave.wallHeight / 2, z);
  wallGroup.add(mesh);
}

function buildWallSegmentsForSide(sideOpenings: Opening[], orientation: OpeningSide): void {
  const halfWidth = cave.width / 2;
  const halfDepth = cave.depth / 2;
  const sorted = [...sideOpenings].sort((a, b) => a.center - b.center);

  if (orientation === "north" || orientation === "south") {
    let cursor = -halfWidth;
    for (const opening of sorted) {
      const start = opening.center - openingWidth / 2;
      const segmentWidth = start - cursor;
      if (segmentWidth > 0.05) {
        createWallSegment(
          segmentWidth,
          cave.wallThickness,
          cursor + segmentWidth / 2,
          orientation === "north" ? -halfDepth : halfDepth,
        );
      }
      cursor = opening.center + openingWidth / 2;
    }

    if (cursor < halfWidth - 0.05) {
      const segmentWidth = halfWidth - cursor;
      createWallSegment(
        segmentWidth,
        cave.wallThickness,
        cursor + segmentWidth / 2,
        orientation === "north" ? -halfDepth : halfDepth,
      );
    }
    return;
  }

  let cursor = -halfDepth;
  for (const opening of sorted) {
    const start = opening.center - openingWidth / 2;
    const segmentDepth = start - cursor;
    if (segmentDepth > 0.05) {
      createWallSegment(
        cave.wallThickness,
        segmentDepth,
        orientation === "west" ? -halfWidth : halfWidth,
        cursor + segmentDepth / 2,
      );
    }
    cursor = opening.center + openingWidth / 2;
  }

  if (cursor < halfDepth - 0.05) {
    const segmentDepth = halfDepth - cursor;
    createWallSegment(
      cave.wallThickness,
      segmentDepth,
      orientation === "west" ? -halfWidth : halfWidth,
      cursor + segmentDepth / 2,
    );
  }
}

function rebuildWalls(): void {
  clearGroup(wallGroup);
  const groups: Record<OpeningSide, Opening[]> = {
    north: openings.filter((opening) => opening.side === "north"),
    south: openings.filter((opening) => opening.side === "south"),
    west: openings.filter((opening) => opening.side === "west"),
    east: openings.filter((opening) => opening.side === "east"),
  };

  buildWallSegmentsForSide(groups.north, "north");
  buildWallSegmentsForSide(groups.south, "south");
  buildWallSegmentsForSide(groups.west, "west");
  buildWallSegmentsForSide(groups.east, "east");
}

function getOpeningEndpoints(opening: Opening): OpeningEndpoints {
  const halfWidth = cave.width / 2;
  const halfDepth = cave.depth / 2;

  if (opening.side === "north") {
    return {
      center: new THREE.Vector3(opening.center, 0.03, -halfDepth),
      left: new THREE.Vector3(opening.center - openingWidth / 2, 0.03, -halfDepth),
      right: new THREE.Vector3(opening.center + openingWidth / 2, 0.03, -halfDepth),
    };
  }

  if (opening.side === "south") {
    return {
      center: new THREE.Vector3(opening.center, 0.03, halfDepth),
      left: new THREE.Vector3(opening.center + openingWidth / 2, 0.03, halfDepth),
      right: new THREE.Vector3(opening.center - openingWidth / 2, 0.03, halfDepth),
    };
  }

  if (opening.side === "west") {
    return {
      center: new THREE.Vector3(-halfWidth, 0.03, opening.center),
      left: new THREE.Vector3(-halfWidth, 0.03, opening.center + openingWidth / 2),
      right: new THREE.Vector3(-halfWidth, 0.03, opening.center - openingWidth / 2),
    };
  }

  return {
    center: new THREE.Vector3(halfWidth, 0.03, opening.center),
    left: new THREE.Vector3(halfWidth, 0.03, opening.center - openingWidth / 2),
    right: new THREE.Vector3(halfWidth, 0.03, opening.center + openingWidth / 2),
  };
}

function createBeamPolygon(points: THREE.Vector3[], color: number, opacity: number): THREE.Mesh {
  const shape = new THREE.Shape(points.map((point) => new THREE.Vector2(point.x, point.z)));
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = 0.025;
  return mesh;
}

function createInteriorRayLine(start: THREE.Vector3, end: THREE.Vector3): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineDashedMaterial({
    color: 0xa30c8f,
    dashSize: 0.4,
    gapSize: 0.18,
    transparent: true,
    opacity: 0.75,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

function createOpeningMarker(opening: Opening, openingData: OpeningEndpoints): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(openingWidth * 0.96, 0.08),
    new THREE.MeshBasicMaterial({
      color: 0xa30c8f,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    }),
  );

  if (opening.side === "north" || opening.side === "south") {
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(openingData.center);
  } else {
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.PI / 2;
    mesh.position.copy(openingData.center);
  }

  return mesh;
}

function rebuildBeams(): void {
  clearGroup(beamGroup);
  clearGroup(openingMarkerGroup);
  clearGroup(interiorRayGroup);

  const sourceFloor = new THREE.Vector3(sourceState.x, 0.03, sourceState.z);
  const showInnerRays = inputs.showInnerRays.checked && !inputs.hideSource.checked;
  const showSource = !inputs.hideSource.checked;

  for (const opening of openings) {
    const openingData = getOpeningEndpoints(opening);
    const leftDirection = openingData.left.clone().sub(sourceFloor).normalize();
    const rightDirection = openingData.right.clone().sub(sourceFloor).normalize();
    const leftOuter = openingData.left.clone().add(leftDirection.multiplyScalar(beamLengthOutside));
    const rightOuter = openingData.right.clone().add(rightDirection.multiplyScalar(beamLengthOutside));

    beamGroup.add(
      createBeamPolygon(
        [openingData.left, openingData.right, rightOuter, leftOuter],
        0xd66bc7,
        0.72,
      ),
    );

    if (showSource) {
      beamGroup.add(
        createBeamPolygon(
          [sourceFloor, openingData.left, openingData.right],
          0xd66bc7,
          0.24,
        ),
      );
    }

    openingMarkerGroup.add(createOpeningMarker(opening, openingData));

    if (showInnerRays) {
      const line = createInteriorRayLine(
        new THREE.Vector3(sourceState.x, 0.04, sourceState.z),
        new THREE.Vector3(openingData.center.x, 0.04, openingData.center.z),
      );
      interiorRayGroup.add(line);
    }
  }
}

function updateSource(): void {
  sourceMesh.position.copy(sourceState);
  sourceHalo.position.set(sourceState.x, 0.012, sourceState.z);
  sourceMesh.visible = !inputs.hideSource.checked;
  sourceHalo.visible = !inputs.hideSource.checked;
  rebuildBeams();
  updateReadout();
}

function updateOpenings(count: number): void {
  openings = openingLayout.slice(0, count);
  rebuildWalls();
  rebuildBeams();
  updateReadout();
}

function pointerDown(event: PointerEvent): void {
  if (!isPointerOverSource(event)) return;
  isDraggingSource = true;
  controls.enabled = false;
  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = "grabbing";
  dragSourceToPointer(event);
}
function pointerMove(event: PointerEvent): void {
  if (isDraggingSource) { dragSourceToPointer(event); return; }
  canvas.style.cursor = isPointerOverSource(event) ? "grab" : "default";
}
function pointerUp(): void {
  isDraggingSource = false;
  controls.enabled = true;
  canvas.style.cursor = "default";
}
canvas.addEventListener("pointerdown", pointerDown, true);
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", pointerUp);
const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(canvas.parentElement!);
resizeRenderer();
updateOpenings(4);
updateSource();
setCameraTopView();
let frame = 0;
function animate(): void {
  controls.update();
  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
}
animate();
return {
  setSource(x: number, y: number, height: number) {
    sourceState.set(x, height, y);
    updateSource();
  },
  setCount(count: number) { inputs.holeCount.value = String(count); updateOpenings(count); },
  setVisibility(hidden: boolean, rays: boolean) {
    inputs.hideSource.checked = hidden;
    inputs.showInnerRays.checked = rays;
    updateSource();
  },
  setView(mode: CameraMode) { switchCamera(mode); setCameraTopView(); },
  resetCamera: setCameraTopView,
  rotateCamera(horizontal: number, vertical: number) {
    if (camera !== perspectiveCamera) return;
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += horizontal;
    spherical.phi = clamp(spherical.phi + vertical, 0.08, Math.PI / 2 - 0.08);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
  },
  zoomCamera(factor: number) {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = clamp(camera.zoom * factor, 0.8, 2.4);
      camera.updateProjectionMatrix();
    } else {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(clamp(offset.length() / factor, 8, 40));
      camera.position.copy(controls.target).add(offset);
    }
    controls.update();
  },
  randomizeOpenings() {
    openingLayout = generateOpenings();
    updateOpenings(Number(inputs.holeCount.value));
  },
  download() {
    renderer.render(scene, camera);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "lichtquellen-hoehle.png";
    link.click();
  },
  dispose() {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    canvas.removeEventListener("pointerdown", pointerDown, true);
    canvas.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerup", pointerUp);
    canvas.removeEventListener("pointercancel", pointerUp);
    controls.dispose();
    scene.traverse((object) => {
      const item = object as THREE.Mesh;
      item.geometry?.dispose();
      if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
      else item.material?.dispose();
    });
    renderer.dispose();
  },
};
}
