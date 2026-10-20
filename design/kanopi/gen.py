"""Generates the SolidCraft script for the glass kanopi (mm). Run: python3 gen.py > kanopi.json"""
import json

W, D = 6000, 4000          # frame width (X) and depth (Y); back of frame against the wall at Y=D
COL = 100                  # column section 100x100
BEAM_H = 200               # perimeter beam 100x200
TOP = 3200                 # top of steel = underside of glass
RAF_W, RAF_H = 80, 150     # rafters/purlins 80x150
BAYS_X, BAYS_Y = 6, 4
GLASS_T, GAP, OVER = 10, 6, 300

cmds = []
steel, glass, site = [], [], []

def box(name, x0, y0, z0, x1, y1, z1, group):
    cmds.append({"command": "solid.box", "params": {
        "length": round(x1 - x0, 2), "width": round(y1 - y0, 2), "height": round(z1 - z0, 2),
        "corner": [x0, y0, z0], "name": name, "body_name": name}})
    group.append(name)

# Columns: three along the front, two at the back corners
for i, x in enumerate([0, W / 2 - COL / 2, W - COL]):
    box(f"Kolom depan {i+1}", x, 0, 0, x + COL, COL, TOP - BEAM_H, steel)
for i, x in enumerate([0, W - COL]):
    box(f"Kolom belakang {i+1}", x, D - COL, 0, x + COL, D, TOP - BEAM_H, steel)

# Perimeter beams
zb = TOP - BEAM_H
box("Balok depan", 0, 0, zb, W, COL, TOP, steel)
box("Balok belakang", 0, D - COL, zb, W, D, TOP, steel)
box("Balok kiri", 0, COL, zb, COL, D - COL, TOP, steel)
box("Balok kanan", W - COL, COL, zb, W, D - COL, TOP, steel)

# Grid: rafters run front-to-back, purlins run side-to-side, tops flush with the beams
zr = TOP - RAF_H
for i in range(1, BAYS_X):
    x = i * W / BAYS_X - RAF_W / 2
    box(f"Rangka melintang {i}", x, COL, zr, x + RAF_W, D - COL, TOP, steel)
for j in range(1, BAYS_Y):
    y = j * D / BAYS_Y - RAF_W / 2
    box(f"Rangka memanjang {j}", COL, y, zr, W - COL, y + RAF_W, TOP, steel)

# Glass: one panel per bay, edge panels run out over the front and sides
for i in range(BAYS_X):
    for j in range(BAYS_Y):
        x0 = i * W / BAYS_X + GAP / 2 - (OVER if i == 0 else 0)
        x1 = (i + 1) * W / BAYS_X - GAP / 2 + (OVER if i == BAYS_X - 1 else 0)
        y0 = j * D / BAYS_Y + GAP / 2 - (OVER if j == 0 else 0)
        y1 = (j + 1) * D / BAYS_Y - GAP / 2
        box(f"Kaca {i+1}-{j+1}", x0, y0, TOP, x1, y1, TOP + GLASS_T, glass)

# Site context, as in the photos: floor slab and the back/left walls
box("Lantai", -1500, -1500, -150, W + 1500, D + 600, 0, site)
box("Dinding belakang", -600, D, 0, W + 600, D + 300, 2400, site)

cmds.append({"command": "appearance.assign", "params": {"bodies": steel, "color": "#1c1d1f",
             "pbr": {"metallic": 0.3, "roughness": 0.5, "dielectric_ior": 1.5}}})
cmds.append({"command": "appearance.assign", "params": {"bodies": glass, "color": "#bfe3e6", "opacity": 0.35}})
cmds.append({"command": "appearance.assign", "params": {"bodies": site, "color": "#c9ced1"}})
print(json.dumps(cmds, indent=1))
