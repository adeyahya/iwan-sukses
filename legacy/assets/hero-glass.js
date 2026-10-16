// Animasi 3D hero: lima lembaran kaca tempered berjajar seperti di rak gudang,
// membiaskan pola isometrik brand dan satu "spark" amber di belakangnya.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const host = document.getElementById("hero3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
} catch (e) {
  host.classList.add("no-webgl");
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.prepend(renderer.domElement);

const INK = 0x0a0a0b;
const AMBER = 0xffb000;
const scene = new THREE.Scene();
scene.background = new THREE.Color(INK);

// Lingkungan studio: latar gelap dengan strip lampu softbox,
// supaya kaca memantulkan garis cahaya tajam seperti foto produk
const pmrem = new THREE.PMREMGenerator(renderer);
function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050506);
  const strip = (w, h, color, intensity, pos, rotY) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.y = rotY; env.add(m);
  };
  strip(1.2, 14, 0xffffff, 40, [-6, 0, 3], Math.PI / 2);
  strip(0.6, 14, 0xffffff, 30, [6, 0, 1], -Math.PI / 2);
  strip(14, 0.8, 0xffffff, 20, [0, 6, 0], 0);
  strip(0.9, 12, 0xffffff, 35, [-2.5, 0, 8], Math.PI);
  strip(0.5, 12, 0xffffff, 25, [2.8, 0, 8], Math.PI);
  strip(0.8, 8, AMBER, 12, [5, 0, 5], -Math.PI / 3);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(8) }));
  top.position.set(0, 7, 0); top.rotation.x = Math.PI / 2; env.add(top);
  return pmrem.fromScene(env, 0.02).texture;
}
scene.environment = studioEnvironment();
scene.environmentIntensity = 1.5;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

// Latar: kisi rhombus isometrik (30°) seperti IsoPattern brand
function latticeTexture() {
  const w = 34.64 * 4, h = 20 * 4;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  g.fillStyle = "#0A0A0B";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#44474F";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(w / 2, 0); g.lineTo(w, h / 2); g.lineTo(w / 2, h); g.lineTo(0, h / 2); g.closePath();
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(16, 18);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshBasicMaterial({ map: latticeTexture() }));
backdrop.position.z = -4;
scene.add(backdrop);

const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3, 4, 5);
scene.add(key);

// Bahan bersama
const glass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
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
const amberMat = new THREE.MeshBasicMaterial({ color: AMBER });

// Rhombus i-dot (rasio 30°): lebar √3, tinggi 1
function rhombusShape(s = 1) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0.5 * s); sh.lineTo(0.866 * s, 0); sh.lineTo(0, -0.5 * s); sh.lineTo(-0.866 * s, 0); sh.closePath();
  return sh;
}
function pane(w, h, d = 0.06) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(d / 2.5, 0.025)), glass));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat));
  return g;
}
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const clamp01 = (t) => Math.min(Math.max(t, 0), 1);

// Rak lembaran tempered
function buildRak() {
  const root = new THREE.Group();
  const rack = new THREE.Group();
  root.add(rack);
  const SHEETS = 5;
  const sheets = [];
  for (let i = 0; i < SHEETS; i++) {
    const g = pane(1.5, 2.4, 0.08);
    const k = i - (SHEETS - 1) / 2;
    g.userData = { k, baseX: k * 0.58, baseZ: -k * 0.4, delay: i * 0.12 };
    rack.add(g);
    sheets.push(g);
  }
  const spark = new THREE.Mesh(new THREE.ShapeGeometry(rhombusShape(0.62)), amberMat);
  spark.position.set(0.9, 0.55, -2.2);
  root.add(spark);
  return {
    root,
    radius: 2.3,
    update(t, tl) {
      for (const s of sheets) {
        const { k, baseX, baseZ, delay } = s.userData;
        const intro = easeOut((tl - 0.15 - delay) / 1.1);
        const wave = Math.sin(t * 0.9 - k * 0.7);
        s.position.set(baseX * (0.85 + 0.15 * intro), (1 - intro) * -3.2 + wave * 0.07, baseZ + wave * 0.05);
        s.rotation.y = Math.sin(t * 0.55 + k * 0.5) * 0.18;
      }
      rack.rotation.y = -0.75 + Math.sin(t * 0.25) * 0.22;
      spark.position.x = 0.9 + Math.sin(t * 0.4) * 0.5;
      spark.position.y = 0.55 + Math.cos(t * 0.5) * 0.25;
    },
  };
}

const active = buildRak();
const stage = new THREE.Group(); // ikut gerak kursor
stage.add(active.root);
scene.add(stage);

// Interaksi kursor
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
host.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const r = host.getBoundingClientRect();
  pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
});
host.addEventListener("pointerleave", () => { pointer.tx = 0; pointer.ty = 0; });

// Kamera menyesuaikan ukuran rak dan rasio kanvas (pita lebar di HP, kolom tinggi di desktop)
function fit() {
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const dist = active.radius / Math.tan(Math.min(vfov, hfov) / 2);
  camera.position.set(0, 0.2, dist);
  camera.lookAt(0, 0, 0);
}
function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  fit();
}

const clock = new THREE.Clock();

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);

function frame() {
  const now = clock.getElapsedTime();
  const t = reduceMotion ? 3 : now;
  const tl = t;
  pointer.x += (pointer.tx - pointer.x) * 0.06;
  pointer.y += (pointer.ty - pointer.y) * 0.06;
  active.update(t, tl);
  stage.rotation.y = pointer.x * 0.4;
  stage.rotation.x = pointer.y * 0.15;
  scene.environmentRotation.y = t * 0.35; // pantulan cahaya menyapu permukaan kaca
  renderer.render(scene, camera);
}
function loop() {
  if (visible) frame();
  requestAnimationFrame(loop);
}

new ResizeObserver(resize).observe(host);
resize();
frame();
host.classList.add("ready");
if (!reduceMotion) requestAnimationFrame(loop);
