// Scene 3D shower box parametrik untuk konfigurator.
// Satuan dunia = meter. Dinding belakang di z = 0, dinding kiri di x = 0, lantai di y = 0.
// Sisi depan kaca berada di z = depth, dari x = 0 sampai x = width.
import * as THREE from "three";

import { arGlassMaterial, glassMaterial, ProductScene, tileTexture } from "@/components/configurator/scenes/product-scene";
import { doorWidth, finishes, hasDoor, type Handle, type ShowerConfig } from "@/lib/configurators/shower";

export class ShowerScene extends ProductScene<ShowerConfig> {
  private door: { group: THREE.Group; kind: "swing" | "slide"; baseX: number; travel: number } | null = null;
  private doorOpen = 0;
  private doorTarget = 0;

  constructor(host: HTMLElement) {
    super(host, { minDistance: 2.2, maxDistance: 7, minAzimuth: -0.15, maxAzimuth: 1.45 });
  }

  protected tick() {
    this.doorOpen += (this.doorTarget - this.doorOpen) * 0.1;
    if (this.door?.kind === "swing") this.door.group.rotation.y = -this.doorOpen * THREE.MathUtils.degToRad(70);
    if (this.door?.kind === "slide") this.door.group.position.x = this.door.baseX - this.doorOpen * this.door.travel;
  }

  setDoorOpen(open: boolean) {
    this.doorTarget = open ? 1 : 0;
  }

  protected build(c: ShowerConfig, first: boolean) {
    const W = c.width / 100;
    const D = c.depth / 100;
    const H = c.height / 100;
    const T = c.thickness / 1000;
    const dw = doorWidth(c) / 100;

    // ── Ruangan: lantai, dinding belakang, dinding kiri (dan kanan untuk pintu ayun/geser) ──
    this.clear(this.room);
    const floorTex = tileTexture("#E4E6E8", "#CDD1D5", 4, 4);
    const wallTex = tileTexture("#F4F4F2", "#DEDFDC", 2, 4);
    this.resetTextures(floorTex, wallTex);
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
    this.clear(this.product);
    this.door = null;
    const glass = glassMaterial(c.glass);
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
    const box = (sx: number, sy: number, sz: number, pos: THREE.Vector3, parent: THREE.Object3D = this.product) => {
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
      this.product.add(m);
    };
    const wallClamps = (pos: (y: number) => THREE.Vector3) => {
      for (const y of [0.3, H - 0.3]) box(0.03, 0.05, 0.03, pos(y));
    };

    const fixedFrontW = c.layout === "walkin" ? W : c.layout === "geser" ? W / 2 : W - dw;
    // Panel depan tetap, menempel dinding kiri
    const front = panel(fixedFrontW - GAP, H);
    front.position.set(0, 0, D);
    this.product.add(front);
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
      this.product.add(door);
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
      this.product.add(door);
      this.door = { group: door, kind: "swing", baseX: fixedFrontW, travel: 0 };

      if (c.layout === "ayun") {
        wallClamps((y) => new THREE.Vector3(W - 0.015, y, D)); // stopper di dinding kanan
      } else {
        // Panel samping kanan, dari dinding belakang ke sudut depan
        const side = panel(D - GAP, H);
        side.rotation.y = Math.PI / 2;
        side.position.set(W, 0, D);
        this.product.add(side);
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
    this.product.add(head);

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

  // ── AR: pintu tertutup, garis tapak di lantai ──
  protected arGlass() {
    return arGlassMaterial(this.config!.glass);
  }

  protected arPrepare() {
    const saved = this.doorOpen;
    this.doorOpen = 0;
    if (this.door?.kind === "swing") this.door.group.rotation.y = 0;
    if (this.door?.kind === "slide") this.door.group.position.x = this.door.baseX;
    return () => {
      this.doorOpen = saved;
    };
  }

  protected arExtras(root: THREE.Group) {
    const c = this.config!;
    this.footprint(root, 0, 0, c.width / 100, c.depth / 100);
  }
}
