// Scene 3D shower box parametrik untuk konfigurator.
// Satuan dunia = meter. Dinding belakang di z = 0, dinding kiri di x = 0, lantai di y = 0.
// Sisi depan kaca berada di z = depth, dari x = 0 sampai x = width.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

import { doorWidth, finishes, hasDoor, type Handle, type ShowerConfig } from "@/lib/configurator";

function tileTexture(base: string, grout: string, cols: number, rows: number, size = 512) {
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

export class ShowerScene {
  private renderer: THREE.WebGLRenderer;
  private labels: CSS2DRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
  private controls: OrbitControls;
  // world dicerminkan (scale.x = -1) saat pintu dipilih di kiri
  private world = new THREE.Group();
  private room = new THREE.Group();
  private shower = new THREE.Group();
  private door: { group: THREE.Group; kind: "swing" | "slide"; baseX: number; travel: number } | null = null;
  private doorOpen = 0;
  private doorTarget = 0;
  private config: ShowerConfig | null = null;
  private target = new THREE.Vector3();
  private ro: ResizeObserver;
  private raf = 0;
  private textures: THREE.Texture[] = [];
  private envTexture: THREE.Texture;

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
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
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(3, 5, 4);
    this.world.add(this.room, this.shower);
    this.scene.add(sun, this.world);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 7;
    this.controls.minPolarAngle = 0.5;
    this.controls.maxPolarAngle = 1.52;
    this.controls.minAzimuthAngle = -0.15;
    this.controls.maxAzimuthAngle = 1.45;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.loop();
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
    this.doorOpen += (this.doorTarget - this.doorOpen) * 0.1;
    if (this.door?.kind === "swing") this.door.group.rotation.y = -this.doorOpen * THREE.MathUtils.degToRad(70);
    if (this.door?.kind === "slide") this.door.group.position.x = this.door.baseX - this.doorOpen * this.door.travel;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  };

  setDoorOpen(open: boolean) {
    this.doorTarget = open ? 1 : 0;
  }

  private clear(group: THREE.Group) {
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

  private label(text: string, pos: THREE.Vector3) {
    const el = document.createElement("span");
    el.textContent = text;
    el.className = "rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-paper";
    const obj = new CSS2DObject(el);
    obj.position.copy(pos);
    this.shower.add(obj);
  }

  update(c: ShowerConfig, first = false) {
    this.config = c;
    const W = c.width / 100;
    const D = c.depth / 100;
    const H = c.height / 100;
    const T = c.thickness / 1000;
    const dw = doorWidth(c) / 100;

    // ── Ruangan: lantai, dinding belakang, dinding kiri (dan kanan untuk pintu ayun/geser) ──
    this.clear(this.room);
    this.textures.forEach((t) => t.dispose());
    const floorTex = tileTexture("#E4E6E8", "#CDD1D5", 4, 4);
    const wallTex = tileTexture("#F4F4F2", "#DEDFDC", 2, 4);
    this.textures = [floorTex, wallTex];
    const roomW = W + 1.2;
    const roomD = Math.max(D, 0.9) + 1.4;
    const RH = 2.5;
    floorTex.repeat.set(roomW / 0.6, roomD / 0.6);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(roomW / 2, 0, roomD / 2);
    this.room.add(floor);
    const wall = (w: number, pos: THREE.Vector3, rotY: number) => {
      const t = wallTex.clone();
      t.needsUpdate = true;
      t.repeat.set(w / 0.6, RH / 0.6);
      this.textures.push(t);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, RH), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }));
      m.position.copy(pos);
      m.rotation.y = rotY;
      this.room.add(m);
    };
    wall(roomW, new THREE.Vector3(roomW / 2, RH / 2, 0), 0);
    wall(roomD, new THREE.Vector3(0, RH / 2, roomD / 2), Math.PI / 2);
    if (c.layout === "ayun" || c.layout === "geser") wall(roomD, new THREE.Vector3(W, RH / 2, roomD / 2), -Math.PI / 2);

    // ── Kaca dan aksesoris ──
    this.clear(this.shower);
    this.door = null;
    const glass = new THREE.MeshPhysicalMaterial({
      transmission: c.glass === "riben" ? 0.92 : 1,
      // Bening diberi rona hijau tipis seperti kaca float asli supaya terlihat di latar terang
      color: c.glass === "riben" ? 0x7d858c : c.glass === "sandblast" ? 0xf5f7f8 : 0xe6f2ee,
      roughness: c.glass === "sandblast" ? 0.55 : 0.03,
      thickness: 0.02,
      ior: 1.5,
      attenuationColor: new THREE.Color("#cfe9df"),
      attenuationDistance: 0.8,
      specularIntensity: 1,
      side: THREE.DoubleSide,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x6b7078, transparent: true, opacity: 0.9 });
    const metal = new THREE.MeshStandardMaterial({
      color: finishes.find((f) => f.value === c.finish)!.color,
      metalness: 1,
      roughness: c.finish === "hitam" ? 0.55 : 0.25,
    });
    const GAP = 0.004;

    const panel = (w: number, h: number) => {
      const g = new THREE.Group();
      const geo = new THREE.BoxGeometry(w, h, T);
      const mesh = new THREE.Mesh(geo, glass);
      mesh.position.set(w / 2, h / 2, 0);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      edges.position.copy(mesh.position);
      g.add(mesh, edges);
      return g;
    };
    const box = (sx: number, sy: number, sz: number, pos: THREE.Vector3, parent: THREE.Object3D = this.shower) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), metal);
      m.position.copy(pos);
      parent.add(m);
      return m;
    };
    const bar = (from: THREE.Vector3, to: THREE.Vector3, r = 0.009) => {
      const len = from.distanceTo(to);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), metal);
      m.position.copy(from).add(to).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      this.shower.add(m);
    };
    const wallClamps = (pos: (y: number) => THREE.Vector3) => {
      for (const y of [0.3, H - 0.3]) box(0.03, 0.05, 0.03, pos(y));
    };

    const fixedFrontW = c.layout === "walkin" ? W : c.layout === "geser" ? W / 2 : W - dw;
    // Panel depan tetap, menempel dinding kiri
    const front = panel(fixedFrontW - GAP, H);
    front.position.set(0, 0, D);
    this.shower.add(front);
    wallClamps((y) => new THREE.Vector3(0.015, y, D));

    // Gagang di sisi bebas pintu; x dalam koordinat daun pintu
    const handle = (door: THREE.Group, x: number, type: Handle) => {
      if (type === "knob") {
        for (const z of [-0.03, 0.03]) {
          const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.035, 24), metal);
          knob.rotation.x = Math.PI / 2;
          knob.position.set(x, 1.0, z + Math.sign(z) * 0.005);
          door.add(knob);
        }
        return;
      }
      const len = type === "tarik" ? 0.6 : 0.3;
      for (const z of [-0.035, 0.035]) {
        const h = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, len, 16), metal);
        h.position.set(x, 1.05, z);
        door.add(h);
      }
      for (const y of [1.05 - len / 2 + 0.03, 1.05 + len / 2 - 0.03]) box(0.02, 0.02, 0.07, new THREE.Vector3(x, y, 0), door);
    };
    // Tambahan pada daun pintu: towel bar dan karet bawah
    const doorExtras = (door: THREE.Group, leafX: number, leafW: number) => {
      if (c.extras.includes("towel")) {
        const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, leafW * 0.55, 16), metal);
        tb.rotation.z = Math.PI / 2;
        tb.position.set(leafX + leafW / 2, 1.38, 0.06);
        door.add(tb);
        for (const dx of [-leafW * 0.25, leafW * 0.25]) box(0.02, 0.02, 0.06, new THREE.Vector3(leafX + leafW / 2 + dx, 1.38, 0.03), door);
      }
      if (c.extras.includes("karet")) {
        const seal = new THREE.Mesh(new THREE.BoxGeometry(leafW, 0.018, T + 0.006), new THREE.MeshStandardMaterial({ color: 0x3a3d45, roughness: 0.8 }));
        seal.position.set(leafX + leafW / 2, 0.009, 0);
        door.add(seal);
      }
    };

    if (c.layout === "walkin") {
      // Stabilizer dari ujung panel ke dinding belakang
      bar(new THREE.Vector3(W - 0.03, H - 0.06, D), new THREE.Vector3(W - 0.03, H - 0.06, 0));
      box(0.04, 0.04, 0.03, new THREE.Vector3(W - 0.03, H - 0.06, D));
    } else if (c.layout === "geser") {
      // Rel atas sepanjang sisi depan, pintu menggantung di depan panel tetap
      const railY = H + 0.03;
      const railZ = D + 0.03;
      box(W, 0.03, 0.012, new THREE.Vector3(W / 2, railY, railZ + 0.02));
      for (const x of [0.02, W - 0.02]) box(0.04, 0.05, 0.06, new THREE.Vector3(x, railY, D + 0.02));
      const door = new THREE.Group();
      const baseX = W - dw;
      door.position.set(baseX, 0, railZ);
      const leaf = panel(dw, H - 0.02);
      leaf.position.y = 0.01;
      door.add(leaf);
      for (const x of [0.12, dw - 0.12]) {
        const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 24), metal);
        roller.rotation.x = Math.PI / 2;
        roller.position.set(x, H + 0.0, 0.02);
        door.add(roller);
        box(0.02, 0.06, T + 0.012, new THREE.Vector3(x, H - 0.03, 0), door);
      }
      handle(door, 0.08, c.handle);
      doorExtras(door, 0, dw);
      this.shower.add(door);
      this.door = { group: door, kind: "slide", baseX, travel: dw - 0.15 };
      wallClamps((y) => new THREE.Vector3(W - 0.015, y, railZ)); // stopper di dinding kanan
    } else {
      // Pintu ayun, berengsel pada tepi panel tetap, membuka ke luar
      const door = new THREE.Group();
      door.position.set(fixedFrontW, 0, D);
      const leaf = panel(dw - GAP * 2, H - 0.01);
      leaf.position.x = GAP;
      door.add(leaf);
      for (const y of [0.3, H - 0.3]) box(0.06, 0.07, T + 0.02, new THREE.Vector3(0.01, y, 0), door);
      handle(door, dw - 0.09, c.handle);
      doorExtras(door, GAP, dw - GAP * 2);
      this.shower.add(door);
      this.door = { group: door, kind: "swing", baseX: fixedFrontW, travel: 0 };

      if (c.layout === "ayun") {
        wallClamps((y) => new THREE.Vector3(W - 0.015, y, D)); // stopper di dinding kanan
      } else {
        // Panel samping kanan, dari dinding belakang ke sudut depan
        const side = panel(D - GAP, H);
        side.rotation.y = Math.PI / 2;
        side.position.set(W, 0, D);
        this.shower.add(side);
        wallClamps((y) => new THREE.Vector3(W, y, 0.015));
        box(0.035, 0.05, 0.035, new THREE.Vector3(W, H - 0.3, D)); // konektor sudut
        box(0.035, 0.05, 0.035, new THREE.Vector3(W, 0.3, D));
      }
    }

    // Kepala shower di dinding belakang sebagai penanda skala
    const sx = Math.min(W, 1) / 2;
    bar(new THREE.Vector3(sx, 0.9, 0.02), new THREE.Vector3(sx, 2.0, 0.02), 0.011);
    bar(new THREE.Vector3(sx, 2.0, 0.02), new THREE.Vector3(sx, 2.0, 0.28), 0.011);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 32), metal);
    head.position.set(sx, 1.99, 0.32);
    this.shower.add(head);

    // Label ukuran
    this.label(`${c.width} cm`, new THREE.Vector3(W / 2, 0.06, D + 0.12));
    this.label(`${c.height} cm`, new THREE.Vector3(c.layout === "walkin" ? W + 0.08 : W + 0.12, H / 2, D));
    if (c.layout === "walkin" || c.layout === "sudut") this.label(`${c.depth} cm`, new THREE.Vector3(W + 0.1, 0.06, D / 2));

    // Pintu di kiri: cerminkan seluruh ruangan dan shower terhadap tengah sisi depan
    const mirror = hasDoor(c.layout) && c.doorSide === "kiri";
    this.world.scale.x = mirror ? -1 : 1;
    this.world.position.x = mirror ? W : 0;

    // Kamera: bidik tengah shower; posisi awal dari depan-kanan
    this.target.set(W / 2, H * 0.48, D / 2);
    if (first) {
      this.controls.target.copy(this.target);
      const r = Math.max(W, H, D) * 2.3 + 0.8;
      this.camera.position.set(W / 2 + r * 0.5, 1.75, D / 2 + r * 0.87);
    }
  }

  // Model untuk AR: hanya shower (tanpa ruangan), pintu tertutup, transform dan pencerminan
  // "dipanggang" ke geometri, titik asal di lantai tengah, dan bahan kaca versi sederhana
  // karena AR Quick Look/WebXR tidak mendukung efek bias (transmission).
  async exportGLB(): Promise<ArrayBuffer> {
    const c = this.config!;
    const W = c.width / 100;
    const D = c.depth / 100;

    const saved = this.doorOpen;
    this.doorOpen = 0;
    if (this.door?.kind === "swing") this.door.group.rotation.y = 0;
    if (this.door?.kind === "slide") this.door.group.position.x = this.door.baseX;
    this.world.updateMatrixWorld(true);

    const glassMat = new THREE.MeshStandardMaterial({
      color: c.glass === "riben" ? 0x5f666d : c.glass === "sandblast" ? 0xf2f4f5 : 0xcfe6de,
      transparent: true,
      opacity: c.glass === "sandblast" ? 0.8 : c.glass === "riben" ? 0.6 : 0.3,
      roughness: c.glass === "sandblast" ? 0.7 : 0.05,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const root = new THREE.Group();
    const center = new THREE.Matrix4();
    this.shower.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const geo = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(o.matrixWorld);
      // Pencerminan (pintu di kiri) membalik urutan segitiga; kembalikan agar sisi depan benar
      if (o.matrixWorld.determinant() < 0 && geo.index) {
        const idx = geo.index.array;
        for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
        geo.index.needsUpdate = true;
      }
      const isGlass = o.material instanceof THREE.MeshPhysicalMaterial;
      root.add(new THREE.Mesh(geo, isGlass ? glassMat : (o.material as THREE.Material).clone()));
    });

    // Garis tapak di lantai supaya area yang dipakai shower terlihat jelas
    const edge = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.9 });
    const footprint = [
      [W / 2, D, W, 0.012],
      [W / 2, 0, W, 0.012],
      [0, D / 2, 0.012, D],
      [W, D / 2, 0.012, D],
    ];
    for (const [x, z, sx, sz] of footprint) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.003, sz), edge);
      m.position.set(x, 0.0015, z);
      m.updateMatrix();
      m.geometry.applyMatrix4(m.matrix);
      m.position.set(0, 0, 0);
      root.add(m);
    }

    // Titik asal di tengah tapak, di permukaan lantai
    const box = new THREE.Box3().setFromObject(root);
    center.makeTranslation(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    root.children.forEach((m) => (m as THREE.Mesh).geometry.applyMatrix4(center));

    this.doorOpen = saved;
    const result = (await new GLTFExporter().parseAsync(root, { binary: true })) as ArrayBuffer;
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        if (o.material !== glassMat && o.material !== edge) (o.material as THREE.Material).dispose();
      }
    });
    glassMat.dispose();
    edge.dispose();
    return result;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    this.clear(this.room);
    this.clear(this.shower);
    this.textures.forEach((t) => t.dispose());
    this.envTexture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }
}
