// Scene 3D kaca potong custom. Satuan meter.
// Lembaran berdiri di atas dudukan, panjang searah x, lebar searah y (tinggi),
// di atas lantai bergaris 10 cm sebagai pembanding skala.
import * as THREE from "three";

import { glassMaterial, ProductScene, tileTexture } from "@/components/configurator/scenes/product-scene";
import type { CutConfig } from "@/lib/configurators/kaca-potong";

export class GlassCutScene extends ProductScene<CutConfig> {
  constructor(host: HTMLElement) {
    super(host, { minDistance: 0.4, maxDistance: 8, minPolar: 0.3, maxPolar: 1.6, minAzimuth: -1.25, maxAzimuth: 1.25 });
  }

  protected build(c: CutConfig, first: boolean) {
    const L = c.length / 100;
    const H = c.width / 100;
    const T = c.thickness / 1000;
    const BASE = 0.03;

    // ── Lantai bergaris 10 cm ──
    this.clear(this.room);
    const grid = tileTexture("#F3F4F5", "#DADDE1", 1, 1, 128);
    this.resetTextures(grid);
    const size = Math.max(L, H) * 3 + 1.5;
    grid.repeat.set(size / 0.1, size / 0.1);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: grid, roughness: 0.8 }));
    floor.rotation.x = -Math.PI / 2;
    this.room.add(floor);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(Math.min(L * 0.6, 0.6), BASE, 0.07), new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.7 }));
    stand.position.set(0, BASE / 2, 0);
    this.room.add(stand);

    // ── Bentuk lembaran dengan lubang ──
    // Bevel di ExtrudeGeometry melebar ke luar sebesar bevelSize, jadi bentuk dasarnya dikecilkan
    const bevel =
      c.edge === "bevel"
        ? { size: 0.01, thick: T * 0.35, segments: 1 }
        : c.edge === "poles"
          ? { size: 0.0008, thick: 0.0008, segments: 2 }
          : null;
    const inset = bevel?.size ?? 0;
    const w = L / 2 - inset;
    const h = H / 2 - inset;
    const shape = new THREE.Shape();
    if (c.shape === "bulat") {
      shape.absellipse(0, 0, w, h, 0, Math.PI * 2, false, 0);
    } else {
      const r = c.shape === "tumpul" ? Math.min(0.03, w, h) : 0;
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      if (r) shape.quadraticCurveTo(w, -h, w, -h + r);
      shape.lineTo(w, h - r);
      if (r) shape.quadraticCurveTo(w, h, w - r, h);
      shape.lineTo(-w + r, h);
      if (r) shape.quadraticCurveTo(-w, h, -w, h - r);
      shape.lineTo(-w, -h + r);
      if (r) shape.quadraticCurveTo(-w, -h, -w + r, -h);
    }
    if (c.holes) {
      const inX = Math.min(0.04, L / 4);
      const inY = Math.min(0.04, H / 4);
      const spots = c.holes === 2 ? [[-1, 0], [1, 0]] : [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (const [sx, sy] of spots) {
        const hole = new THREE.Path();
        hole.absarc(sx * (L / 2 - inX), sy * (H / 2 - inY), 0.005, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: bevel ? Math.max(T - bevel.thick * 2, T * 0.3) : T,
      bevelEnabled: !!bevel,
      bevelSize: bevel?.size ?? 0,
      bevelThickness: bevel?.thick ?? 0,
      bevelSegments: bevel?.segments ?? 1,
      curveSegments: 48,
    });
    geo.center();

    // Grup 0 = muka depan/belakang, grup 1 = sisi (tepi kaca kehijauan)
    const face =
      c.glass === "cermin"
        ? new THREE.MeshStandardMaterial({ color: 0xdfe4e7, metalness: 1, roughness: 0.03 })
        : glassMaterial(c.glass === "riben" ? "riben" : c.glass === "es" ? "sandblast" : "bening");
    const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0xa9d3bf, transmission: 0.5, roughness: c.edge === "potong" ? 0.6 : 0.05, ior: 1.5 });

    this.clear(this.product);
    const stack = Math.min(c.qty, 4);
    for (let i = 0; i < stack; i++) {
      const sheet = new THREE.Mesh(geo, [face, edgeMat]);
      sheet.position.set(0, BASE + H / 2, -i * 0.05);
      this.product.add(sheet);
      if (i === 0) {
        const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: 0x6b7078, transparent: true, opacity: 0.8 }));
        outline.position.copy(sheet.position);
        this.product.add(outline);
      }
    }

    this.label(`${c.length} cm`, new THREE.Vector3(0, BASE + 0.015, T + 0.06));
    this.label(`${c.width} cm`, new THREE.Vector3(L / 2 + 0.06, BASE + H / 2, 0));
    if (c.qty > 1) this.label(`× ${c.qty} lembar`, new THREE.Vector3(-L / 2, BASE + H + 0.06, 0));

    this.target.set(0, BASE + H / 2, 0);
    if (first) {
      this.controls.target.copy(this.target);
      const r = Math.max(L, H) * 2.1 + 0.45;
      this.camera.position.set(r * 0.3, BASE + H * 0.7 + 0.1, r * 0.95);
    }
  }
}
