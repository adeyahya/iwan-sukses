"use client";

import { useEffect, useRef, useState } from "react";

// Animasi 3D hero: lima lembaran kaca tempered berjajar seperti di rak gudang,
// membiaskan pola isometrik brand dan satu "spark" amber di belakangnya.
// Three.js dimuat dinamis supaya tidak memperberat bundle awal.
export function HeroGlass({ focusId }: { focusId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const host = hostRef.current;
    const focus = document.getElementById(focusId);
    const area = host?.parentElement;
    if (!host || !focus || !area) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
      if (disposed) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      } catch {
        setState("fallback");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = "absolute inset-0 size-full";
      host.prepend(renderer.domElement);

      const AMBER = 0xffb000;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0b);

      // Lingkungan studio: latar gelap dengan strip lampu softbox,
      // supaya kaca memantulkan garis cahaya tajam seperti foto produk
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = new THREE.Scene();
      env.background = new THREE.Color(0x050506);
      const strip = (w: number, h: number, color: number, intensity: number, pos: [number, number, number], rotY: number) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
        );
        m.position.set(...pos);
        m.rotation.y = rotY;
        env.add(m);
      };
      strip(1.2, 14, 0xffffff, 40, [-6, 0, 3], Math.PI / 2);
      strip(0.6, 14, 0xffffff, 30, [6, 0, 1], -Math.PI / 2);
      strip(14, 0.8, 0xffffff, 20, [0, 6, 0], 0);
      strip(0.9, 12, 0xffffff, 35, [-2.5, 0, 8], Math.PI);
      strip(0.5, 12, 0xffffff, 25, [2.8, 0, 8], Math.PI);
      strip(0.8, 8, AMBER, 12, [5, 0, 5], -Math.PI / 3);
      const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(8) }));
      top.position.set(0, 7, 0);
      top.rotation.x = Math.PI / 2;
      env.add(top);
      const envTexture = pmrem.fromScene(env, 0.02).texture;
      scene.environment = envTexture;
      scene.environmentIntensity = 1.5;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      // Latar: kisi rhombus isometrik (30°) seperti IsoPattern brand
      const c = document.createElement("canvas");
      c.width = 34.64 * 4;
      c.height = 80;
      const g = c.getContext("2d")!;
      g.fillStyle = "#0A0A0B";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#34363D";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(c.width / 2, 0);
      g.lineTo(c.width, c.height / 2);
      g.lineTo(c.width / 2, c.height);
      g.lineTo(0, c.height / 2);
      g.closePath();
      g.stroke();
      const lattice = new THREE.CanvasTexture(c);
      lattice.wrapS = lattice.wrapT = THREE.RepeatWrapping;
      // Ukuran satu rhombus tetap 0,866 × 0,5 unit di mana pun, berapa pun lebar layar
      const PLANE_W = 90;
      const PLANE_H = 52;
      lattice.repeat.set(PLANE_W / 0.866, PLANE_H / 0.5);
      lattice.colorSpace = THREE.SRGBColorSpace;
      lattice.anisotropy = 8;
      const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), new THREE.MeshBasicMaterial({ map: lattice }));
      backdrop.position.z = -4;
      scene.add(backdrop);

      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 4, 5);
      scene.add(key);

      const glass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.7,
        ior: 1.52,
        attenuationColor: new THREE.Color("#bfe6d6"), // rona hijau khas tepi kaca float
        attenuationDistance: 1.6,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        specularIntensity: 1,
        side: THREE.DoubleSide,
      });
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xcdeee2, transparent: true, opacity: 0.85 });

      // Rak lembaran tempered
      const stage = new THREE.Group();
      const rack = new THREE.Group();
      stage.add(rack);
      scene.add(stage);
      const sheetGeo = new RoundedBoxGeometry(1.5, 2.4, 0.08, 3, 0.025);
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 2.4, 0.08));
      const sheets = Array.from({ length: 5 }, (_, i) => {
        const s = new THREE.Group();
        s.add(new THREE.Mesh(sheetGeo, glass));
        s.add(new THREE.LineSegments(edgeGeo, edgeMat));
        const k = i - 2;
        s.userData = { k, baseX: k * 0.58, baseZ: -k * 0.4, delay: i * 0.12 };
        rack.add(s);
        return s;
      });

      const sparkShape = new THREE.Shape();
      sparkShape.moveTo(0, 0.31);
      sparkShape.lineTo(0.537, 0);
      sparkShape.lineTo(0, -0.31);
      sparkShape.lineTo(-0.537, 0);
      sparkShape.closePath();
      const spark = new THREE.Mesh(new THREE.ShapeGeometry(sparkShape), new THREE.MeshBasicMaterial({ color: AMBER }));
      spark.position.set(0.9, 0.55, -2.2);
      stage.add(spark);

      // Kanvas menutupi seluruh hero, tetapi kamera "dibidikkan" ke area fokus:
      // frustum dibuat seolah gambar lebih besar dan berpusat di tengah area fokus,
      // lalu hanya potongan seukuran kanvas yang dirender (setViewOffset).
      const RADIUS = 2.55;
      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer.setSize(w, h, false);
        const hr = host.getBoundingClientRect();
        const fr = focus.getBoundingClientRect();
        const fx = fr.left - hr.left + fr.width / 2;
        const fy = fr.top - hr.top + fr.height / 2;
        const vw = 2 * Math.max(fx, w - fx);
        const vh = 2 * Math.max(fy, h - fy);
        camera.aspect = vw / vh;
        camera.setViewOffset(vw, vh, vw / 2 - fx, vh / 2 - fy, w, h);
        // Jarak kamera agar rak (radius RADIUS) muat di sisi terpendek area fokus
        const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
        const fit = Math.max(Math.min(fr.width, fr.height), 1);
        camera.position.set(0, 0.2, (RADIUS * vh) / (tanHalf * fit));
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      ro.observe(focus);
      resize();

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = focus.getBoundingClientRect();
        const clamp = (v: number) => Math.min(Math.max(v, -1.5), 1.5);
        pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
        pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      const onLeave = () => {
        pointer.tx = 0;
        pointer.ty = 0;
      };
      area.addEventListener("pointermove", onMove);
      area.addEventListener("pointerleave", onLeave);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
      const clock = new THREE.Clock();
      const frame = () => {
        const t = reduceMotion ? 3 : clock.getElapsedTime();
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        for (const s of sheets) {
          const { k, baseX, baseZ, delay } = s.userData;
          const intro = easeOut((t - 0.15 - delay) / 1.1);
          const wave = Math.sin(t * 0.9 - k * 0.7);
          s.position.set(baseX * (0.85 + 0.15 * intro), (1 - intro) * -3.2 + wave * 0.07, baseZ + wave * 0.05);
          s.rotation.y = Math.sin(t * 0.55 + k * 0.5) * 0.18;
        }
        rack.rotation.y = -0.75 + Math.sin(t * 0.25) * 0.22;
        spark.position.x = 0.9 + Math.sin(t * 0.4) * 0.5;
        spark.position.y = 0.55 + Math.cos(t * 0.5) * 0.25;
        stage.rotation.y = pointer.x * 0.4;
        stage.rotation.x = pointer.y * 0.15;
        scene.environmentRotation.y = t * 0.35; // pantulan cahaya menyapu permukaan kaca
        renderer.render(scene, camera);
      };

      let raf = 0;
      const loop = () => {
        if (visible) frame();
        raf = requestAnimationFrame(loop);
      };
      frame();
      setState("ready");
      if (!reduceMotion) raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        area.removeEventListener("pointermove", onMove);
        area.removeEventListener("pointerleave", onLeave);
        scene.traverse((o) => {
          const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } };
          m.geometry?.dispose();
          m.material?.dispose();
        });
        lattice.dispose();
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [focusId]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="absolute inset-0 -z-10 touch-pan-y overflow-hidden bg-ink [&>canvas]:transition-opacity [&>canvas]:duration-200 data-[state=loading]:[&>canvas]:opacity-0"
      data-state={state}
    >
      {state === "fallback" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="https://images.unsplash.com/photo-1758998256408-ab2c9fbec19b?w=1200&q=75&auto=format&fit=crop"
          alt=""
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
