// Aturan video galeri, dipakai bersama oleh admin (browser), server action, dan /video/<id>.

// Unggahan dikirim per potongan ini (di bawah batas 10 MB server action) dan disimpan per potongan juga
export const VIDEO_CHUNK = 4 * 1024 * 1024;
export const MAX_VIDEO = 150 * 1024 * 1024;

// Video unggahan (/video/<id>) atau video bawaan situs (/proyek/<nama>.mp4)
export const isVideoSrc = (v: unknown): v is string => typeof v === "string" && /^(\/video\/[\w-]+|\/proyek\/[\w-]+\.mp4)$/.test(v);
