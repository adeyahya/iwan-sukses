// Kelas dasar scene konfigurator: renderer, kamera orbit, label ukuran HTML,
// pencahayaan, siklus render, dan ekspor model AR. Satuan dunia = meter.
// Tiap produk menurunkan kelas ini dan mengisi build() dengan geometrinya.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export type SceneOptions = {
  minDistance: number;
  maxDistance: number;
  minPolar?: number;
  maxPolar?: number;
  minAzimuth?: number;
  maxAzimuth?: number;
  shadows?: boolean;
};

export function tileTexture(base: string, grout: string, cols: number, rows: number, size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  g.strokeStyle = grout;
  g.lineWidth = 3;
  for (let i = 0; i <= cols; i++) {
    g.beginPath();
    g.moveTo((i * size) / cols, 0);
    g.lineTo((i * size) / cols, size);
    g.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    g.beginPath();
    g.moveTo(0, (j * size) / rows);
    g.lineTo(size, (j * size) / rows);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Kaca "asli" untuk tampilan web (bias cahaya). Bening diberi rona hijau tipis seperti kaca float.
export function glassMaterial(kind: "bening" | "sandblast" | "riben") {
  return new THREE.MeshPhysicalMaterial({
    transmission: kind === "riben" ? 0.92 : 1,
    color: kind === "riben" ? 0x7d858c : kind === "sandblast" ? 0xf5f7f8 : 0xe6f2ee,
    roughness: kind === "sandblast" ? 0.55 : 0.03,
    thickness: 0.02,
    ior: 1.5,
    attenuationColor: new THREE.Color("#cfe9df"),
    attenuationDistance: 0.8,
    specularIntensity: 1,
    side: THREE.DoubleSide,
  });
}

// Kaca versi AR: Quick Look/WebXR tidak mendukung transmission, jadi pakai opacity
export function arGlassMaterial(kind: "bening" | "sandblast" | "riben") {
  return new THREE.MeshStandardMaterial({
    color: kind === "riben" ? 0x5f666d : kind === "sandblast" ? 0xf2f4f5 : 0xcfe6de,
    transparent: true,
    opacity: kind === "sandblast" ? 0.8 : kind === "riben" ? 0.6 : 0.3,
    roughness: kind === "sandblast" ? 0.7 : 0.05,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

export abstract class ProductScene<C> {
  protected renderer: THREE.WebGLRenderer;
  protected labels: CSS2DRenderer;
  protected scene = new THREE.Scene();
  protected camera = new THREE.PerspectiveCamera(35, 1, 0.05, 80);
  protected controls: OrbitControls;
  protected sun = new THREE.DirectionalLight(0xffffff, 1.2);
  /** world bisa dicerminkan; room = konteks (tidak ikut AR), product = yang dijual (ikut AR) */
  protected world = new THREE.Group();
  protected room = new THREE.Group();
  protected product = new THREE.Group();
  protected target = new THREE.Vector3();
  protected textures: THREE.Texture[] = [];
  protected config: C | null = null;
  private ro: ResizeObserver;
  private raf = 0;
  private envTexture: THREE.Texture;

  constructor(
    protected host: HTMLElement,
    opts: SceneOptions,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (opts.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.renderer.domElement.className = "absolute inset-0 size-full";
    host.appendChild(this.renderer.domElement);

    // Label ukuran sebagai elemen HTML yang mengikuti posisi 3D
    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = "pointer-events-none absolute inset-0";
    host.appendChild(this.labels.domElement);

    this.scene.background = new THREE.Color(0xeef0f2);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 1.1;
    this.sun.position.set(3, 5, 4);
    this.world.add(this.room, this.product);
    this.scene.add(this.sun, this.sun.target, this.world);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = opts.minDistance;
    this.controls.maxDistance = opts.maxDistance;
    this.controls.minPolarAngle = opts.minPolar ?? 0.5;
    this.controls.maxPolarAngle = opts.maxPolar ?? 1.52;
    this.controls.minAzimuthAngle = opts.minAzimuth ?? -Infinity;
    this.controls.maxAzimuthAngle = opts.maxAzimuth ?? Infinity;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.loop();
  }

  /** Bangun ulang ruangan dan produk untuk konfigurasi c */
  protected abstract build(c: C, first: boolean): void;
  /** Animasi per frame (pintu dsb.) */
  protected tick(): void {}

  update(c: C, first = false) {
    this.config = c;
    this.build(c, first);
  }

  private resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.renderer.setSize(w, h, false);
    this.labels.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden) return;
    this.controls.target.lerp(this.target, 0.12);
    this.tick();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  };

  protected clear(group: THREE.Object3D) {
    group.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
      if (o instanceof CSS2DObject) o.element.remove();
    });
    group.clear();
  }

  protected resetTextures(...keep: THREE.Texture[]) {
    this.textures.forEach((t) => t.dispose());
    this.textures = keep;
  }

  protected label(text: string, pos: THREE.Vector3, parent: THREE.Object3D = this.product) {
    const el = document.createElement("span");
    el.textContent = text;
    el.className = "rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-paper";
    const obj = new CSS2DObject(el);
    obj.position.copy(pos);
    parent.add(obj);
  }

  // ── AR ──
  /** Bahan pengganti kaca untuk AR */
  protected arGlass(): THREE.Material {
    return arGlassMaterial("bening");
  }
  /** Siapkan pose netral (mis. pintu tertutup); kembalikan fungsi pemulih */
  protected arPrepare(): () => void {
    return () => {};
  }
  /** Tambahan khusus AR dalam koordinat dunia (mis. garis tapak di lantai) */
  protected arExtras(root: THREE.Group): void {
    void root;
  }
  /** Titik asal model AR: default tengah tapak di lantai */
  protected arOrigin(box: THREE.Box3) {
    return new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
  }

  // Model untuk AR: hanya grup product, transform dan pencerminan "dipanggang" ke geometri,
  // kaca diganti versi sederhana, lalu diekspor sebagai GLB biner.
  async exportGLB(): Promise<ArrayBuffer> {
    const restore = this.arPrepare();
    this.world.updateMatrixWorld(true);
    const glass = this.arGlass();
    const root = new THREE.Group();
    this.product.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const geo = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(o.matrixWorld);
      // Pencerminan membalik urutan segitiga; kembalikan agar sisi depan benar
      if (o.matrixWorld.determinant() < 0 && geo.index) {
        const idx = geo.index.array;
        for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
        geo.index.needsUpdate = true;
      }
      const isGlass = o.material instanceof THREE.MeshPhysicalMaterial;
      root.add(new THREE.Mesh(geo, isGlass ? glass : (o.material as THREE.Material).clone()));
    });
    restore();
    this.arExtras(root);

    const origin = this.arOrigin(new THREE.Box3().setFromObject(root));
    const shift = new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z);
    root.children.forEach((m) => (m as THREE.Mesh).geometry.applyMatrix4(shift));

    const result = (await new GLTFExporter().parseAsync(root, { binary: true })) as ArrayBuffer;
    this.clear(root);
    return result;
  }

  /** Garis persegi tipis di lantai (dalam koordinat dunia) untuk AR */
  protected footprint(root: THREE.Group, x0: number, z0: number, x1: number, z1: number) {
    const edge = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.9 });
    const w = x1 - x0;
    const d = z1 - z0;
    const t = 0.012;
    for (const [x, z, sx, sz] of [
      [x0 + w / 2, z0, w, t],
      [x0 + w / 2, z1, w, t],
      [x0, z0 + d / 2, t, d],
      [x1, z0 + d / 2, t, d],
    ]) {
      const geo = new THREE.BoxGeometry(sx, 0.003, sz).translate(x, 0.0015, z);
      root.add(new THREE.Mesh(geo, edge));
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    this.clear(this.room);
    this.clear(this.product);
    this.resetTextures();
    this.envTexture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }
}
