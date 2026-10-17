// Scene 3D shower box parametrik untuk konfigurator.
// Satuan dunia = meter. Dinding belakang di z = 0, dinding kiri di x = 0, lantai di y = 0.
// Sisi depan kaca berada di z = depth, dari x = 0 sampai x = width.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

import { doorWidth, finishes, type ShowerConfig } from "@/lib/configurator";

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
  private room = new THREE.Group();
  private shower = new THREE.Group();
  private door: THREE.Group | null = null;
  private doorAngle = 0;
  private doorTarget = 0;
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
    this.scene.add(sun, this.room, this.shower);

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
    this.doorAngle += (this.doorTarget - this.doorAngle) * 0.1;
    if (this.door) this.door.rotation.y = -this.doorAngle;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  };

  setDoorOpen(open: boolean) {
    this.doorTarget = open ? THREE.MathUtils.degToRad(70) : 0;
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
    const W = c.width / 100;
    const D = c.depth / 100;
    const H = c.height / 100;
    const T = c.thickness / 1000;
    const dw = doorWidth(c.width) / 100;

    // ── Ruangan: lantai, dinding belakang, dinding kiri (dan kanan untuk pintu ayun) ──
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
    if (c.layout === "ayun") wall(roomD, new THREE.Vector3(W, RH / 2, roomD / 2), -Math.PI / 2);

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

    const fixedFrontW = c.layout === "walkin" ? W : W - dw;
    // Panel depan tetap, menempel dinding kiri
    const front = panel(fixedFrontW - GAP, H);
    front.position.set(0, 0, D);
    this.shower.add(front);
    wallClamps((y) => new THREE.Vector3(0.015, y, D));

    if (c.layout === "walkin") {
      // Stabilizer dari ujung panel ke dinding belakang
      bar(new THREE.Vector3(W - 0.03, H - 0.06, D), new THREE.Vector3(W - 0.03, H - 0.06, 0));
      box(0.04, 0.04, 0.03, new THREE.Vector3(W - 0.03, H - 0.06, D));
    } else {
      // Pintu, berengsel pada tepi panel tetap, membuka ke luar
      const door = new THREE.Group();
      door.position.set(fixedFrontW, 0, D);
      const leaf = panel(dw - GAP * 2, H - 0.01);
      leaf.position.x = GAP;
      door.add(leaf);
      for (const y of [0.3, H - 0.3]) box(0.06, 0.07, T + 0.02, new THREE.Vector3(0.01, y, 0), door);
      // Gagang vertikal di sisi bebas pintu
      const hx = dw - 0.09;
      for (const z of [-0.035, 0.035]) {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.3, 16), metal);
        handle.position.set(hx, 1.05, z);
        door.add(handle);
      }
      box(0.02, 0.02, 0.07, new THREE.Vector3(hx, 1.18, 0), door);
      box(0.02, 0.02, 0.07, new THREE.Vector3(hx, 0.92, 0), door);
      this.shower.add(door);
      this.door = door;

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
    if (c.layout !== "ayun") this.label(`${c.depth} cm`, new THREE.Vector3(W + 0.1, 0.06, D / 2));

    // Kamera: bidik tengah shower; posisi awal dari depan-kanan
    this.target.set(W / 2, H * 0.48, D / 2);
    if (first) {
      this.controls.target.copy(this.target);
      const r = Math.max(W, H, D) * 2.3 + 0.8;
      this.camera.position.set(W / 2 + r * 0.5, 1.75, D / 2 + r * 0.87);
    }
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
