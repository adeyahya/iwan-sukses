// Scene 3D railing kaca. Satuan meter.
// Railing berdiri di tepi lantai (z = 0, void ke arah +z). Bentuk L menambah sisi kedua di x = +L/2 menuju -z.
// Tangga naik ke arah +x; railing di sisi terbuka tangga, tinggi diukur tegak dari garis ujung anak tangga.
import * as THREE from "three";

import { glassMaterial, ProductScene, tileTexture } from "@/components/configurator/scenes/product-scene";
import { railingSpans, STAIR_GOING, STAIR_RISE, type RailingConfig } from "@/lib/configurators/railing";
import { finishColors } from "@/lib/configurators/shared";

const POST_R = 0.025; // tiang bulat Ø 2 inci
const RAIL_R = 0.025;
const GLASS_GAP = 0.1; // celah kaca dari lantai dan dari handrail

/** Satu sisi railing: garis datar A→B di lantai, ref(u) = tinggi garis acuan, foot(u) = tinggi kaki tiang */
type Run = { a: THREE.Vector2; b: THREE.Vector2; ref: (u: number) => number; foot: (u: number) => number; skipFirstPost?: boolean };

export class RailingScene extends ProductScene<RailingConfig> {
  constructor(host: HTMLElement) {
    super(host, { minDistance: 1.5, maxDistance: 16, minPolar: 0.4, maxPolar: 1.62 });
  }

  protected build(c: RailingConfig, first: boolean) {
    const H = c.height / 100;
    const T = c.thickness / 1000;
    const L1 = c.length / 100;
    const L2 = c.length2 / 100;
    const r = STAIR_RISE / 100;
    const g = STAIR_GOING / 100;

    // ── Sisi-sisi railing ──
    const flat = () => 0;
    let runs: Run[];
    let steps = 0;
    if (c.layout === "tangga") {
      steps = Math.max(3, Math.round(L1 / g));
      const Lf = steps * g;
      const x0 = -Lf / 2;
      // Garis ujung anak tangga; kaki tiang di atas injakan anak tangga tempat ia berdiri
      const ref = (u: number) => r + u * (r / g);
      const foot = (u: number) => Math.min(steps, Math.floor(u / g + 1e-6) + 1) * r;
      runs = [{ a: new THREE.Vector2(x0, 0), b: new THREE.Vector2(x0 + Lf, 0), ref, foot }];
    } else {
      runs = [{ a: new THREE.Vector2(-L1 / 2, 0), b: new THREE.Vector2(L1 / 2, 0), ref: flat, foot: flat }];
      if (c.layout === "l") runs.push({ a: new THREE.Vector2(L1 / 2, 0), b: new THREE.Vector2(L1 / 2, -L2), ref: flat, foot: flat, skipFirstPost: true });
    }

    this.buildRoom(c, steps, L1, L2);

    // ── Railing ──
    this.clear(this.product);
    const glass = glassMaterial(c.glass);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x6b7078, transparent: true, opacity: 0.9 });
    const metal = (finish: "stainless" | "hitam") =>
      new THREE.MeshStandardMaterial({
        color: finishColors[finish],
        metalness: finish === "stainless" ? 1 : 0.4,
        roughness: finish === "stainless" ? 0.22 : 0.55,
      });
    const postMat = metal(c.post);
    const railMat = c.handrail === "kayu" ? new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.6 }) : metal(c.handrail);
    const add = (m: THREE.Mesh) => {
      this.product.add(m);
      return m;
    };
    // Silinder dari p ke q
    const cyl = (p: THREE.Vector3, q: THREE.Vector3, radius: number, mat: THREE.Material) => {
      const m = add(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, p.distanceTo(q), 20), mat));
      m.position.copy(p).add(q).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize());
      return m;
    };

    const { spans } = railingSpans(c);
    runs.forEach((run, ri) => {
      const len = run.a.distanceTo(run.b);
      const d2 = run.b.clone().sub(run.a).normalize();
      const dir = new THREE.Vector3(d2.x, 0, d2.y);
      const n = new THREE.Vector3(-d2.y, 0, d2.x); // ke arah void
      const at = (u: number, y: number, off = 0) => new THREE.Vector3(run.a.x + d2.x * u + n.x * off, y, run.a.y + d2.y * u + n.z * off);
      const count = spans[ri];
      const us = Array.from({ length: count + 1 }, (_, k) => (k * len) / count);
      const bottom = (u: number) => run.ref(u) + GLASS_GAP;
      const top = (u: number) => run.ref(u) + H - GLASS_GAP - RAIL_R;
      // Kaca jepit di garis tiang; kaca dudukan di sisi void tiang
      const off = c.system === "jepit" ? 0 : POST_R + 0.03 + T / 2;

      // Panel kaca: jajaran genjang pada bidang tegak sepanjang sisi
      const basis = new THREE.Matrix4().makeBasis(dir, new THREE.Vector3(0, 1, 0), n);
      const pane = (u0: number, u1: number) => {
        const s = new THREE.Shape();
        s.moveTo(u0, bottom(u0));
        s.lineTo(u1, bottom(u1));
        s.lineTo(u1, top(u1));
        s.lineTo(u0, top(u0));
        s.closePath();
        const geo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false }).translate(0, 0, -T / 2).applyMatrix4(basis);
        const m = add(new THREE.Mesh(geo, glass));
        m.position.copy(at(0, 0, off));
        // Garis tepi supaya panel bening tetap terbaca di latar terang
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
        edges.position.copy(m.position);
        this.product.add(edges);
      };
      // Jepit/dudukan bulat menembus kaca pada jarak `off` dari garis tiang
      const clampAt = (u: number, y: number) => {
        cyl(at(u, y, off - T / 2 - 0.012), at(u, y, off + T / 2 + 0.012), 0.022, postMat);
        if (c.system === "dudukan") cyl(at(u, y, 0), at(u, y, off - T / 2), 0.009, postMat);
      };

      for (let k = 0; k < count; k++) {
        const [u0, u1] = [us[k], us[k + 1]];
        if (c.system === "jepit") {
          const gap = POST_R + 0.03;
          pane(u0 + gap, u1 - gap);
          // Dua jepit di tiap sisi panel, menempel di permukaan tiang
          for (const u of [u0 + POST_R + 0.022, u1 - POST_R - 0.022]) {
            clampAt(u, bottom(u) + 0.15);
            clampAt(u, top(u) - 0.15);
          }
        } else {
          // Kaca menerus; ujung sisi sejajar tepi tiang, sambungan tepat di tiang
          pane(k === 0 ? u0 - POST_R : u0 + 0.004, k === count - 1 ? u1 + POST_R : u1 - 0.004);
        }
      }

      // Tiang, plat kaki, dan dudukan kaca
      us.forEach((u, k) => {
        if (k === 0 && run.skipFirstPost) return;
        const footY = run.foot(u);
        const topY = run.ref(u) + H - RAIL_R;
        cyl(at(u, footY), at(u, topY), POST_R, postMat);
        cyl(at(u, footY), at(u, footY + 0.012), 0.045, postMat);
        if (c.system === "dudukan") {
          clampAt(u, bottom(u) + 0.15);
          clampAt(u, top(u) - 0.15);
        }
      });

      // Handrail di atas tiang
      const p = at(0, run.ref(0) + H - RAIL_R);
      const q = at(len, run.ref(len) + H - RAIL_R);
      if (c.handrail === "kayu") {
        const v = q.clone().sub(p);
        const m = add(new THREE.Mesh(new THREE.BoxGeometry(v.length() + 0.07, 0.04, 0.075), railMat));
        m.position.copy(p).add(q).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.005, 0));
        m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), v.normalize());
      } else {
        const ext = dir.clone().multiplyScalar(RAIL_R);
        cyl(p.clone().sub(ext), q.clone().add(ext), RAIL_R, railMat);
      }

      // Label ukuran
      const real = c.layout === "tangga" ? `${c.length} cm datar` : `${ri === 0 ? c.length : c.length2} cm`;
      this.label(real, at(len / 2, run.ref(len / 2) + H + 0.14));
      if (ri === 0) this.label(`${c.height} cm`, at(0, run.ref(0) + H / 2, 0.12).sub(dir.clone().multiplyScalar(0.12)));
    });

    // Kamera: dari depan agak ke samping, sedikit di atas handrail
    const span = c.layout === "tangga" ? steps * g : c.layout === "l" ? Math.max(L1, L2) : L1;
    const midY = c.layout === "tangga" ? (steps * r) / 2 + H / 2 : H * 0.6;
    this.target.set(c.layout === "l" ? L1 * 0.15 : 0, midY, c.layout === "l" ? -L2 * 0.25 : 0);
    if (first) {
      this.controls.target.copy(this.target);
      const dist = Math.max(span, 1.5) * 0.8 + 1.1;
      this.camera.position.set(dist * 0.35, midY + 0.9 + span * 0.12, dist);
    }
  }

  // ── Konteks: lantai mezanin dengan tepi pelat, atau anak tangga ──
  private buildRoom(c: RailingConfig, steps: number, L1: number, L2: number) {
    this.clear(this.room);
    const marble = tileTexture("#EEEDEA", "#DCDAD5", 2, 2);
    this.resetTextures(marble);
    const floorMat = new THREE.MeshStandardMaterial({ map: marble, roughness: 0.35 });
    const slabMat = new THREE.MeshStandardMaterial({ color: 0xe4e2dd, roughness: 0.8 });
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x2c2e31, roughness: 0.4 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.9 });
    const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      this.room.add(m);
      return m;
    };

    if (c.layout === "tangga") {
      const r = STAIR_RISE / 100;
      const g = STAIR_GOING / 100;
      const x0 = -(steps * g) / 2;
      const Wd = 1.1;
      // Badan dan tegakan tangga sedikit lebih gelap supaya anak tangga terbaca di latar terang
      const riserMat = new THREE.MeshStandardMaterial({ color: 0x6f6c66, roughness: 0.7 });
      const treadMat = new THREE.MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.35 });
      for (let i = 0; i < steps; i++) {
        box(x0 + i * g, 0, -Wd, x0 + (i + 1) * g, (i + 1) * r - 0.02, 0, riserMat);
        // Injakan marmer dengan list gelap di ujungnya, seperti di foto
        box(x0 + i * g - 0.02, (i + 1) * r - 0.02, -Wd, x0 + (i + 1) * g, (i + 1) * r, 0.02, treadMat);
        box(x0 + i * g - 0.02, (i + 1) * r - 0.05, 0, x0 + (i + 1) * g, (i + 1) * r - 0.02, 0.02, edgeMat);
      }
      const top = steps * r;
      box(x0 + steps * g, 0, -Wd, x0 + steps * g + 1.4, top - 0.02, 0.02, riserMat);
      box(x0 + steps * g, top - 0.02, -Wd, x0 + steps * g + 1.4, top, 0.02, treadMat);
      box(x0 - 2, -0.02, -Wd - 0.15, x0 + steps * g + 1.4, top + 2.6, -Wd, wallMat);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(steps * g + 6, 6), floorMat.clone());
      marble.repeat.set(1, 1);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.001, 1.5);
      this.room.add(ground);
      return;
    }

    // Pelat lantai di belakang railing, tepinya terlihat; lantai bawah 3 m di depan
    const back = c.layout === "l" ? L2 + 1.2 : 2.5;
    const x0 = -L1 / 2 - 1.2;
    const x1 = L1 / 2;
    marble.repeat.set((x1 - x0) / 1.2, back / 1.2);
    box(x0, -0.02, -back, x1, 0, 0, floorMat);
    box(x0, -0.32, -back, x1, -0.02, 0, slabMat);
    box(x0, -0.06, 0, x1, -0.02, 0.01, edgeMat);
    if (c.layout === "l") box(x1, -0.06, -back, x1 + 0.01, -0.02, 0, edgeMat);
    else box(x1, -0.32, -back, x1 + 1.2, 0, 0, floorMat);
    box(x0, -0.02, -back - 0.15, c.layout === "l" ? x1 : x1 + 1.2, 2.8, -back, wallMat);
    const lower = new THREE.Mesh(new THREE.PlaneGeometry(L1 + 12, 12), new THREE.MeshStandardMaterial({ color: 0xd9d7d2, roughness: 0.9 }));
    lower.rotation.x = -Math.PI / 2;
    lower.position.set(0, -3, 0);
    this.room.add(lower);
  }
}
