import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface Branch3DDatum {
  name: string;
  pending: number;
  rejected: number;
  priority?: string;
}

export interface Scene3DCallbacks {
  onSelectBranch?: (branch: Branch3DDatum | null) => void;
  onHoverBranch?: (branch: Branch3DDatum | null) => void;
  onFallback?: (reason: string) => void;
}

type CameraPreset = 'overview' | 'vault' | 'topBranch' | 'orbit';

function detectSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|Microsoft Basic Render Driver/i.test(renderer);
  } catch {
    return true;
  }
}

function createPlazaTextures(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  ctx.fillStyle = '#0e1d1b';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(20, 184, 166, 0.22)';
  ctx.lineWidth = 2;
  const step = 64;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#555555';
  rctx.fillRect(0, 0, size, size);
  rctx.strokeStyle = '#222222';
  rctx.lineWidth = 2;
  for (let i = 0; i <= size; i += step) {
    rctx.beginPath();
    rctx.moveTo(i, 0);
    rctx.lineTo(i, size);
    rctx.stroke();
    rctx.beginPath();
    rctx.moveTo(0, i);
    rctx.lineTo(size, i);
    rctx.stroke();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(6, 6);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(6, 6);

  return { map, roughnessMap };
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.24)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class BankingScene3D {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private envRenderTarget: THREE.WebGLRenderTarget | null = null;

  private vaultGroup = new THREE.Group();
  private branchesGroup = new THREE.Group();
  private orbitRingA!: THREE.Mesh;
  private orbitRingB!: THREE.Mesh;
  private crystalCore!: THREE.Mesh;
  private particles!: THREE.Points;
  private plazaFloor!: THREE.Mesh;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-99, -99);
  private interactiveTargets: Array<{
    mesh: THREE.Object3D;
    data: Branch3DDatum;
    worldCenter: THREE.Vector3;
  }> = [];

  private branchData: Branch3DDatum[] = [];
  private callbacks: Scene3DCallbacks;
  private animId: number | null = null;
  private clock = new THREE.Clock();
  private disposed = false;
  private autoRotate = true;
  private isDark = true;
  private selectedBranchName: string | null = null;

  private desiredCamPos: THREE.Vector3 | null = null;
  private desiredTarget: THREE.Vector3 | null = null;
  private contactShadowTex!: THREE.CanvasTexture;
  private floorTextures!: { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture };

  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, callbacks: Scene3DCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.outline = 'none';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);

    this.init();
  }

  private init() {
    const isSoftware = detectSoftwareWebGL();
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 420;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: !isSoftware,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      this.callbacks.onFallback?.('WebGL is unavailable on this browser.');
      return;
    }

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(
      isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = !isSoftware;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);

    this.scene = new THREE.Scene();
    this.applyAtmosphereColors();

    // Studio IBL environment
    try {
      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      const roomEnv = new RoomEnvironment();
      this.envRenderTarget = this.pmremGenerator.fromScene(roomEnv, 0.04);
      this.scene.environment = this.envRenderTarget.texture;
      roomEnv.dispose();
    } catch {
      // Safe fallback to directional lighting if PMREM fails
    }

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 180);
    this.camera.position.set(13.5, 9.2, 15.5);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 6.5;
    this.controls.maxDistance = 38;
    this.controls.minPolarAngle = 0.22;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.target.set(0, 1.8, 0);
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 0.48;

    this.controls.addEventListener('start', () => {
      this.desiredCamPos = null;
      this.desiredTarget = null;
    });

    this.setupLighting();
    this.buildPlazaAndVault();
    this.buildAtmosphericMotes();

    this.scene.add(this.vaultGroup);
    this.scene.add(this.branchesGroup);

    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('click', this.onCanvasClick);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', this.resize);
    }

    this.animate();
  }

  private applyAtmosphereColors() {
    if (!this.scene) return;
    if (this.isDark) {
      const bg = new THREE.Color('#091614');
      this.scene.background = bg;
      this.scene.fog = new THREE.FogExp2(0x091614, 0.017);
    } else {
      const bg = new THREE.Color('#d9e7e2');
      this.scene.background = bg;
      this.scene.fog = new THREE.FogExp2(0xd9e7e2, 0.014);
    }
  }

  public setTheme(isDark: boolean) {
    this.isDark = isDark;
    this.applyAtmosphereColors();
  }

  public setAutoRotate(enabled: boolean) {
    this.autoRotate = enabled;
    if (this.controls) {
      this.controls.autoRotate = enabled;
    }
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x0f2723, 0.65);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff5e4, 1.85);
    key.position.set(12, 18, 11);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 2;
    key.shadow.camera.far = 48;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 16;
    key.shadow.camera.bottom = -16;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x2dd4bf, 0.72);
    rim.position.set(-14, 8, -12);
    this.scene.add(rim);
  }

  private buildPlazaAndVault() {
    this.floorTextures = createPlazaTextures();
    this.contactShadowTex = createContactShadowTexture();

    const floorGeo = new THREE.CircleGeometry(32, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.floorTextures.map,
      roughnessMap: this.floorTextures.roughnessMap,
      roughness: 0.72,
      metalness: 0.25,
    });
    this.plazaFloor = new THREE.Mesh(floorGeo, floorMat);
    this.plazaFloor.rotation.x = -Math.PI / 2;
    this.plazaFloor.position.y = 0;
    this.plazaFloor.receiveShadow = true;
    this.scene.add(this.plazaFloor);

    // Subtle inlaid orbital meridian rings on floor
    const ringFloorMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
    });
    [4.4, 8.8, 12.2].forEach((radius) => {
      const g = new THREE.RingGeometry(radius - 0.04, radius + 0.04, 72);
      const m = new THREE.Mesh(g, ringFloorMat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.008;
      this.scene.add(m);
    });

    // Contact shadow for central vault
    const vaultShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 6.8),
      new THREE.MeshBasicMaterial({
        map: this.contactShadowTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      })
    );
    vaultShadow.rotation.x = -Math.PI / 2;
    vaultShadow.position.y = 0.01;
    this.vaultGroup.add(vaultShadow);

    // Part 1: Outer stepped octagonal dark granite plinth
    const graniteMat = new THREE.MeshStandardMaterial({
      color: 0x162624,
      roughness: 0.45,
      metalness: 0.35,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.24,
      metalness: 0.88,
    });
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.28,
      metalness: 0.72,
    });

    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.35, 8), graniteMat);
    step1.position.y = 0.175;
    step1.castShadow = true;
    step1.receiveShadow = true;
    this.vaultGroup.add(step1);

    // Part 2: Upper bevelled plinth
    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.3, 0.42, 8), graniteMat);
    step2.position.y = 0.56;
    step2.castShadow = true;
    step2.receiveShadow = true;
    this.vaultGroup.add(step2);

    // Part 3: Brass collar ring
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.78, 0.16, 24), brassMat);
    collar.position.y = 0.85;
    collar.castShadow = true;
    this.vaultGroup.add(collar);

    // Part 4: Four architectural buttress fins
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.2, 0.65), titaniumMat);
      fin.position.set(Math.cos(angle) * 1.18, 1.9, Math.sin(angle) * 1.18);
      fin.rotation.y = -angle;
      fin.castShadow = true;
      this.vaultGroup.add(fin);
    }

    // Part 5: Glass prism cylinder core
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x5eead4,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.65,
      thickness: 0.9,
      ior: 1.5,
      transparent: true,
      opacity: 0.88,
    });
    const prismColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.88, 2.5, 16), glassMat);
    prismColumn.position.y = 2.15;
    prismColumn.castShadow = true;
    this.vaultGroup.add(prismColumn);

    // Part 6: Glowing octahedral credit crystal inside atrium
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.65,
    });
    this.crystalCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), crystalMat);
    this.crystalCore.position.y = 2.45;
    this.vaultGroup.add(this.crystalCore);

    // Part 7: Top crown cap
    const crownCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.96, 0.45, 8), brassMat);
    crownCap.position.y = 3.6;
    crownCap.castShadow = true;
    this.vaultGroup.add(crownCap);

    // Part 8 & 9: Dual orbital telemetry rings
    const ringMatA = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: 0x0f766e,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2,
    });
    this.orbitRingA = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.045, 16, 64), ringMatA);
    this.orbitRingA.position.y = 2.45;
    this.orbitRingA.rotation.x = Math.PI * 0.36;
    this.vaultGroup.add(this.orbitRingA);

    const ringMatB = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2,
    });
    this.orbitRingB = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.035, 14, 56), ringMatB);
    this.orbitRingB.position.y = 2.45;
    this.orbitRingB.rotation.y = Math.PI * 0.25;
    this.orbitRingB.rotation.x = -Math.PI * 0.32;
    this.vaultGroup.add(this.orbitRingB);
  }

  private buildAtmosphericMotes() {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = 0.6 + Math.random() * 8.5;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  public setBranchData(branches: Branch3DDatum[]) {
    this.branchData = branches.slice(0, 24);
    this.rebuildBranchTowers();
  }

  private rebuildBranchTowers() {
    while (this.branchesGroup.children.length > 0) {
      const child = this.branchesGroup.children[0];
      this.branchesGroup.remove(child);
    }
    this.interactiveTargets = [];

    const items =
      this.branchData.length > 0
        ? this.branchData
        : [
            { name: 'Berhampur Hub', pending: 14, rejected: 3 },
            { name: 'Ganjam Central', pending: 9, rejected: 2 },
            { name: 'Cuttack Prime', pending: 18, rejected: 5 },
            { name: 'Bhubaneswar HQ', pending: 12, rejected: 1 },
            { name: 'Puri Coastal', pending: 7, rejected: 2 },
            { name: 'Balasore North', pending: 11, rejected: 4 },
            { name: 'Rourkela Steel', pending: 15, rejected: 3 },
            { name: 'Sambalpur West', pending: 6, rejected: 1 },
          ];

    const maxLoad = Math.max(
      1,
      ...items.map((b) => b.pending + b.rejected)
    );

    const innerRingCount = Math.min(items.length, 10);

    items.forEach((b, idx) => {
      const isInner = idx < innerRingCount;
      const ringIndex = isInner ? idx : idx - innerRingCount;
      const ringTotal = isInner ? innerRingCount : items.length - innerRingCount;
      const radius = isInner ? 6.6 : 10.6;
      const angle =
        (ringIndex / Math.max(1, ringTotal)) * Math.PI * 2 +
        (isInner ? 0 : Math.PI / Math.max(1, ringTotal));

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const load = b.pending + b.rejected;
      const ratio = load / maxLoad;
      const towerHeight = 1.1 + ratio * 3.8;

      let accentHex = 0x10b981;
      let emissiveHex = 0x065f46;
      if (b.priority === 'critical' || ratio >= 0.72) {
        accentHex = 0xf43f5e;
        emissiveHex = 0x9f1239;
      } else if (b.priority === 'high' || ratio >= 0.42) {
        accentHex = 0xf59e0b;
        emissiveHex = 0x92400e;
      }

      const towerGroup = new THREE.Group();
      towerGroup.position.set(x, 0, z);

      // Soft radial contact shadow
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 2.1),
        new THREE.MeshBasicMaterial({
          map: this.contactShadowTex,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
        })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.012;
      towerGroup.add(shadowMesh);

      // 1. Stepped architectural pad (bottom at y=0)
      const padMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.85, 0.22, 6),
        new THREE.MeshStandardMaterial({
          color: 0x1e2e2b,
          roughness: 0.45,
          metalness: 0.4,
        })
      );
      padMesh.position.y = 0.11;
      padMesh.castShadow = true;
      padMesh.receiveShadow = true;
      towerGroup.add(padMesh);

      // 2. Metallic shaft
      const isSelected = this.selectedBranchName === b.name;
      const shaftMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffffff : accentHex,
        emissive: emissiveHex,
        emissiveIntensity: isSelected ? 0.95 : 0.42,
        roughness: 0.25,
        metalness: 0.72,
      });
      const shaftMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.56, towerHeight, 6),
        shaftMat
      );
      shaftMesh.position.y = 0.22 + towerHeight / 2;
      shaftMesh.castShadow = true;
      shaftMesh.receiveShadow = true;
      towerGroup.add(shaftMesh);

      // 3. Rejection upper cap segment
      if (b.rejected > 0) {
        const rejH = Math.max(0.22, (b.rejected / Math.max(1, load)) * towerHeight * 0.45);
        const rejMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.43, rejH, 6),
          new THREE.MeshStandardMaterial({
            color: 0xe11d48,
            emissive: 0x881337,
            emissiveIntensity: 0.55,
            roughness: 0.3,
            metalness: 0.65,
          })
        );
        rejMesh.position.y = 0.22 + towerHeight + rejH / 2;
        rejMesh.castShadow = true;
        towerGroup.add(rejMesh);
      }

      // 4. Brass/Glow Crown Collar
      const crown = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.045, 10, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfde68a,
          emissive: accentHex,
          emissiveIntensity: 0.85,
          metalness: 0.85,
          roughness: 0.2,
        })
      );
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 0.26 + towerHeight;
      towerGroup.add(crown);

      this.branchesGroup.add(towerGroup);
      this.interactiveTargets.push({
        mesh: shaftMesh,
        data: b,
        worldCenter: new THREE.Vector3(x, 0.22 + towerHeight * 0.6, z),
      });
    });
  }

  public setCameraPreset(preset: CameraPreset) {
    if (!this.camera || !this.controls) return;
    if (preset === 'overview') {
      this.desiredCamPos = new THREE.Vector3(13.5, 9.2, 15.5);
      this.desiredTarget = new THREE.Vector3(0, 1.8, 0);
      this.setAutoRotate(true);
    } else if (preset === 'vault') {
      this.desiredCamPos = new THREE.Vector3(5.2, 4.1, 6.2);
      this.desiredTarget = new THREE.Vector3(0, 2.2, 0);
      this.setAutoRotate(false);
    } else if (preset === 'topBranch') {
      const sorted = [...this.interactiveTargets].sort(
        (a, b) => b.data.pending - a.data.pending
      );
      if (sorted.length > 0) {
        const top = sorted[0];
        this.focusOnBranch(top.data.name);
      }
    } else if (preset === 'orbit') {
      this.desiredCamPos = new THREE.Vector3(0, 14.5, 18.5);
      this.desiredTarget = new THREE.Vector3(0, 1.6, 0);
      this.setAutoRotate(true);
    }
  }

  public focusOnBranch(branchName: string) {
    const found = this.interactiveTargets.find(
      (t) => t.data.name.toLowerCase() === branchName.toLowerCase()
    );
    if (!found) return;
    this.selectedBranchName = found.data.name;
    this.rebuildBranchTowers();
    const dir = found.worldCenter.clone().setY(0).normalize();
    if (dir.lengthSq() < 0.001) dir.set(1, 0, 1).normalize();
    this.desiredCamPos = found.worldCenter
      .clone()
      .addScaledVector(dir, 5.2)
      .add(new THREE.Vector3(0, 3.2, 0));
    this.desiredTarget = found.worldCenter.clone();
    this.setAutoRotate(false);
    this.callbacks.onSelectBranch?.(found.data);
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.interactiveTargets.map((t) => t.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const target = this.interactiveTargets.find((t) => t.mesh === hitObj);
      this.canvas.style.cursor = 'pointer';
      this.callbacks.onHoverBranch?.(target ? target.data : null);
    } else {
      this.canvas.style.cursor = 'grab';
      this.callbacks.onHoverBranch?.(null);
    }
  };

  private onCanvasClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.interactiveTargets.map((t) => t.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const target = this.interactiveTargets.find((t) => t.mesh === hitObj);
      if (target) {
        this.focusOnBranch(target.data.name);
      }
    }
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  };

  private handleContextRestored = () => {
    if (!this.disposed && this.animId === null) {
      this.animate();
    }
  };

  public resize = () => {
    if (this.disposed || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private animate = () => {
    if (this.disposed) return;
    this.animId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    if (this.crystalCore) {
      this.crystalCore.rotation.y += delta * 0.75;
      this.crystalCore.position.y = 2.45 + Math.sin(elapsed * 2.1) * 0.12;
    }
    if (this.orbitRingA) {
      this.orbitRingA.rotation.z += delta * 0.55;
      this.orbitRingA.rotation.y += delta * 0.24;
    }
    if (this.orbitRingB) {
      this.orbitRingB.rotation.z -= delta * 0.45;
      this.orbitRingB.rotation.x += delta * 0.18;
    }
    if (this.particles) {
      this.particles.rotation.y += delta * 0.04;
    }

    if (this.desiredCamPos && this.desiredTarget) {
      const alpha = 1 - Math.exp(-5.5 * delta);
      this.camera.position.lerp(this.desiredCamPos, alpha);
      this.controls.target.lerp(this.desiredTarget, alpha);
      if (this.camera.position.distanceTo(this.desiredCamPos) < 0.08) {
        this.desiredCamPos = null;
        this.desiredTarget = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.disposed = true;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', this.resize);
    }

    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.contactShadowTex?.dispose();
    this.floorTextures?.map.dispose();
    this.floorTextures?.roughnessMap.dispose();
    this.envRenderTarget?.dispose();
    this.pmremGenerator?.dispose();
    this.controls?.dispose();
    this.renderer?.dispose();
  }
}
