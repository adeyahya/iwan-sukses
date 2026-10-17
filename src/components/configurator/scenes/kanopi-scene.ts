// Scene 3D kanopi kaca. Satuan meter.
// Dinding rumah di z = 0 menghadap +z, lantai di y = 0, kanopi terpusat di x = 0
// dan menonjol ke +z sejauh `projection`, menurun sesuai kemiringan.
import * as THREE from "three";

import { arGlassMaterial, glassMaterial, ProductScene, tileTexture } from "@/components/configurator/scenes/product-scene";
import { panelCount, type KanopiConfig } from "@/lib/configurators/kanopi";
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
    const n = panelCount(c);
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
    const rod = (from: THREE.Vector3, to: THREE.Vector3, r = 0.008) => {
      const m = add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, from.distanceTo(to), 12), metal));
      m.position.copy(from).add(to).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    };
    // Titik pada permukaan bawah kaca, sejauh z dari dinding
    const under = (x: number, z: number) => new THREE.Vector3(x, H - z * Math.tan(a) - T / 2, z);

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x6b7078, transparent: true, opacity: 0.9 });
    for (let i = 0; i < n; i++) {
      const geo = new THREE.BoxGeometry(pw - 0.008, T, Lp);
      const m = add(new THREE.Mesh(geo, glass));
      m.position.set(-W / 2 + pw * (i + 0.5), H - drop / 2, P / 2);
      m.rotation.x = a;
      // Garis tepi supaya panel bening tetap terbaca di latar terang
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      edges.position.copy(m.position);
      edges.rotation.copy(m.rotation);
      this.product.add(edges);
    }
    // Profil U aluminium di dinding yang menjepit tepi belakang kaca
    box(W + 0.02, 0.07, 0.06, new THREE.Vector3(0, H, 0.03));

    if (c.support === "kabel") {
      for (const x of joints) {
        const plate = new THREE.Vector3(x, H + 0.7, 0.02);
        const front = under(x, P * 0.88).add(new THREE.Vector3(0, -0.02, 0));
        box(0.1, 0.12, 0.02, plate);
        rod(plate, front);
        // Spider/penjepit bulat di bawah sambungan panel
        const clamp = add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20), metal));
        clamp.position.copy(front);
        clamp.rotation.x = a;
      }
    } else if (c.support === "hollow") {
      for (const x of joints) box(0.04, 0.08, Lp, under(x, P / 2).add(new THREE.Vector3(0, -0.04, 0)), a);
      box(W + 0.04, 0.08, 0.04, under(0, P - 0.02).add(new THREE.Vector3(0, -0.04, 0)));
    } else {
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
      const r = Math.max(W, 3) * 1.25 + 3.5;
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
