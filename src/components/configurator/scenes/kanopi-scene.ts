// Scene 3D kanopi kaca. Satuan meter.
// Dinding rumah di z = 0 menghadap +z, lantai di y = 0, kanopi terpusat di x = 0
// dan menonjol ke +z sejauh `projection`, menurun sesuai kemiringan.
import * as THREE from "three";

import { arGlassMaterial, glassMaterial, ProductScene, tileTexture } from "@/components/configurator/scenes/product-scene";
import { columnCount, kanopiOverhang, panelGrid, type KanopiConfig } from "@/lib/configurators/kanopi";
import { finishColors } from "@/lib/configurators/shared";

// Seberapa gelap bayangan kaca di lantai, per jenis kaca
const SHADOW: Record<KanopiConfig["glass"], number> = { bening: 0.55, sandblast: 0.8, riben: 0.95 };

export class KanopiScene extends ProductScene<KanopiConfig> {
  private hour = 10;

  constructor(host: HTMLElement) {
    super(host, { minDistance: 3, maxDistance: 18, minPolar: 0.35, maxPolar: 1.7, minAzimuth: -1.25, maxAzimuth: 1.25, shadows: true });
    this.scene.environmentIntensity = 0.6;
    this.sun.intensity = 2.4;
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.sun.target.position.set(0, 0, 1.2);
  }

  /** Posisi matahari menurut jam (6–18): melintas dari kanan ke kiri di atas rumah,
   *  agak ke depan, sehingga bayangan kanopi jatuh di lantai teras dan bergeser sepanjang hari */
  setSunHour(hour: number) {
    this.hour = hour;
    const t = ((hour - 6) / 12) * Math.PI;
    this.sun.position.set(Math.cos(t) * 7, 4 + Math.sin(t) * 7, 1.8);
  }

  protected build(c: KanopiConfig, first: boolean) {
    const W = c.width / 100;
    const P = c.projection / 100;
    const H = c.height / 100;
    const a = THREE.MathUtils.degToRad(c.slope);
    const drop = P * Math.tan(a);
    const Lp = P / Math.cos(a);
    const T = c.thickness / 1000;
    const grid = panelGrid(c);
    const n = grid.cols;
    const pw = W / n;
    const joints = Array.from({ length: n + 1 }, (_, k) => -W / 2 + k * pw);

    // ── Konteks: dinding rumah dengan pintu, lantai paving ──
    this.clear(this.room);
    const paving = tileTexture("#DAD7D0", "#C6C2B9", 4, 4);
    const plaster = tileTexture("#EFEDE8", "#E7E4DE", 1, 1);
    this.resetTextures(paving, plaster);
    const WW = W + 3;
    paving.repeat.set(WW / 1.6, 7 / 1.6);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(WW, 7), new THREE.MeshStandardMaterial({ map: paving, roughness: 0.85 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 3.5);
    ground.receiveShadow = true;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(WW, 4), new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.9 }));
    wall.position.set(0, 2, 0);
    wall.receiveShadow = true;
    this.room.add(ground, wall);
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.6 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: 0.5 });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.04), frameMat);
    doorFrame.position.set(0, 1.1, 0.02);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.96, 2.12, 0.05), dark);
    door.position.set(0, 1.06, 0.03);
    this.room.add(doorFrame, door);
    if (W >= 3) {
      for (const sx of [-1, 1]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.04), frameMat);
        win.position.set(sx * Math.min(W / 2 - 0.4, 1.7), 1.55, 0.02);
        const pane = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.98, 0.045), new THREE.MeshStandardMaterial({ color: 0x8a9aa3, roughness: 0.15, metalness: 0.3 }));
        pane.position.copy(win.position);
        this.room.add(win, pane);
      }
    }

    // ── Kanopi ──
    this.clear(this.product);
    const glass = glassMaterial(c.glass);
    const metal = new THREE.MeshStandardMaterial({
      color: finishColors[c.frame],
      metalness: c.frame === "stainless" ? 1 : 0.4,
      roughness: c.frame === "hitam" ? 0.55 : 0.3,
    });
    const add = (m: THREE.Mesh) => {
      m.castShadow = true;
      this.product.add(m);
      return m;
    };
    const box = (sx: number, sy: number, sz: number, pos: THREE.Vector3, rotX = 0) => {
      const m = add(new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), metal));
      m.position.copy(pos);
      m.rotation.x = rotX;
      return m;
    };
    // Titik pada permukaan bawah kaca, sejauh z dari dinding
    const under = (x: number, z: number) => new THREE.Vector3(x, H - z * Math.tan(a) - T / 2, z);

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x6b7078, transparent: true, opacity: 0.9 });
    // Panel kaca dari x0..x1 (lebar) dan z0..z1 (tonjolan), mengikuti kemiringan
    const pane = (x0: number, x1: number, z0: number, z1: number) => {
      const geo = new THREE.BoxGeometry(x1 - x0 - 0.008, T, (z1 - z0) / Math.cos(a) - 0.008);
      const m = add(new THREE.Mesh(geo, glass));
      m.position.set((x0 + x1) / 2, H - ((z0 + z1) / 2) * Math.tan(a), (z0 + z1) / 2);
      m.rotation.x = a;
      // Garis tepi supaya panel bening tetap terbaca di latar terang
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      edges.position.copy(m.position);
      edges.rotation.copy(m.rotation);
      this.product.add(edges);
    };

    if (c.support === "tiang") {
      // Rangka hollow kotak-kotak di bawah kaca, ditopang tiang di depan; kaca menjorok di depan dan sisi
      const O = kanopiOverhang / 100;
      const Wf = W - 2 * O;
      const Pf = P - O;
      const bw = Wf / grid.cols;
      const bd = Pf / grid.rows;
      const xs = Array.from({ length: grid.cols + 1 }, (_, k) => -Wf / 2 + k * bw);
      const zs = Array.from({ length: grid.rows + 1 }, (_, k) => k * bd);
      for (let i = 0; i < grid.cols; i++) {
        for (let j = 0; j < grid.rows; j++) {
          pane(i === 0 ? -W / 2 : xs[i], i === grid.cols - 1 ? W / 2 : xs[i + 1], zs[j], j === grid.rows - 1 ? P : zs[j + 1]);
        }
      }
      // Batang dengan sisi atas rata dengan bawah kaca; panjang l sepanjang z (miring) atau sepanjang x
      const beamZ = (x: number, z0: number, z1: number, w: number, h: number) =>
        box(w, h, (z1 - z0) / Math.cos(a), under(x, (z0 + z1) / 2).add(new THREE.Vector3(0, -h / 2, 0)), a);
      const beamX = (z: number, len: number, w: number, h: number) => box(len, h, w, under(0, z).add(new THREE.Vector3(0, -h / 2, 0)), a);
      // Balok keliling 10×20 cm
      beamX(0.05, Wf, 0.1, 0.2);
      beamX(Pf - 0.05, Wf, 0.1, 0.2);
      for (const sx of [-1, 1]) beamZ(sx * (Wf / 2 - 0.05), 0.1, Pf - 0.1, 0.1, 0.2);
      // Rangka dalam 8×15 cm di setiap sambungan panel
      for (const x of xs.slice(1, -1)) beamZ(x, 0.1, Pf - 0.1, 0.08, 0.15);
      for (const z of zs.slice(1, -1)) beamX(z, Wf - 0.2, 0.08, 0.15);
      // Tiang 10×10 cm sampai bawah balok depan
      const cols = columnCount(c);
      const zc = Pf - 0.05;
      const hc = under(0, zc).y - 0.2;
      for (let k = 0; k < cols; k++) {
        const x = -Wf / 2 + 0.05 + (k * (Wf - 0.1)) / (cols - 1);
        box(0.1, hc, 0.1, new THREE.Vector3(x, hc / 2, zc));
      }
    } else {
      for (let i = 0; i < n; i++) pane(joints[i], joints[i + 1], 0, P);
      // Profil U aluminium di dinding yang menjepit tepi belakang kaca
      box(W + 0.02, 0.07, 0.06, new THREE.Vector3(0, H, 0.03));
    }

    if (c.support === "hollow") {
      for (const x of joints) box(0.04, 0.08, Lp, under(x, P / 2).add(new THREE.Vector3(0, -0.04, 0)), a);
      box(W + 0.04, 0.08, 0.04, under(0, P - 0.02).add(new THREE.Vector3(0, -0.04, 0)));
    } else if (c.support === "bracket") {
      // Sirip segitiga: tepi atas mengikuti bawah kaca, tepi tegak menempel dinding
      const Lf = P * 0.75;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(Lf, -Lf * Math.tan(a));
      shape.lineTo(0, -0.55);
      shape.closePath();
      for (const x of joints) {
        const fin = add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false }), metal));
        fin.rotation.y = -Math.PI / 2; // sumbu x bentuk → arah tonjolan (+z)
        fin.position.set(x + 0.006, H - T / 2, 0);
      }
    }

    if (c.gutter) {
      box(W + 0.04, 0.07, 0.09, new THREE.Vector3(0, H - drop - 0.05, P + 0.03));
      box(0.07, H - drop - 0.05, 0.07, new THREE.Vector3(W / 2 - 0.05, (H - drop - 0.05) / 2, P + 0.03));
    }

    // Label ukuran
    this.label(`${c.width} cm`, new THREE.Vector3(0, H - drop - 0.22, P + 0.12));
    this.label(`${c.projection} cm`, new THREE.Vector3(W / 2 + 0.2, H - drop / 2, P / 2));
    this.label(`${c.height} cm`, new THREE.Vector3(-W / 2 - 0.25, H / 2, 0.05));

    // Bayangan: ortho camera menutupi area kanopi
    const s = this.sun.shadow.camera;
    s.left = -W / 2 - 3;
    s.right = W / 2 + 3;
    s.top = 6;
    s.bottom = -6;
    s.near = 0.5;
    s.far = 30;
    s.updateProjectionMatrix();
    this.sun.shadow.intensity = SHADOW[c.glass];
    this.setSunHour(this.hour);

    // Kamera agak tinggi supaya kanopi dan bayangannya di lantai sama-sama terlihat
    this.target.set(0, H * 0.45, P * 0.55);
    if (first) {
      this.controls.target.copy(this.target);
      const r = Math.max(W, P, 3) * 1.25 + 3.5;
      this.camera.position.set(r * 0.4, H + 0.9, P + r * 0.95);
    }
  }

  // ── AR: tapak area teduh di lantai, titik asal di kaki dinding tengah ──
  protected arGlass() {
    return arGlassMaterial(this.config!.glass);
  }

  protected arExtras(root: THREE.Group) {
    const c = this.config!;
    this.footprint(root, -c.width / 200, 0, c.width / 200, c.projection / 100);
  }

  protected arOrigin() {
    return new THREE.Vector3(0, 0, 0);
  }
}
