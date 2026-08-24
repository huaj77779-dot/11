from __future__ import annotations

from pathlib import Path
import colorsys
import json

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "public" / "stylbiella"
OUTPUT = ROOT / "app" / "lib" / "stylbiella-fabric-colors.ts"


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    value = rgb / 255.0
    value = np.where(value <= 0.04045, value / 12.92, ((value + 0.055) / 1.055) ** 2.4)
    xyz = value @ np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ]).T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    delta = 6 / 29
    f = np.where(xyz > delta**3, np.cbrt(xyz), xyz / (3 * delta**2) + 4 / 29)
    return np.column_stack((116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])))


def kmeans(lab: np.ndarray, k: int = 5) -> tuple[np.ndarray, np.ndarray]:
    light = lab[:, 0]
    chroma = np.hypot(lab[:, 1], lab[:, 2])
    order = np.lexsort((chroma, light))
    seeds = np.linspace(0, len(order) - 1, k, dtype=int)
    centers = lab[order[seeds]].copy()
    labels = np.zeros(len(lab), dtype=int)
    for _ in range(18):
        distance = ((lab[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)
        new_labels = distance.argmin(axis=1)
        if np.array_equal(labels, new_labels):
            break
        labels = new_labels
        for idx in range(k):
            members = lab[labels == idx]
            if len(members):
                centers[idx] = np.median(members, axis=0)
    weights = np.array([(labels == idx).mean() for idx in range(k)])
    return centers, weights


TEXTILE_PALETTE_RGB = {
    "黑色": [(8, 9, 12), (24, 25, 28), (36, 34, 35)],
    "白色": [(252, 251, 246), (242, 242, 238), (232, 230, 222)],
    "灰色": [(58, 61, 65), (91, 94, 98), (137, 139, 140), (183, 184, 181)],
    "蓝色": [(13, 25, 48), (25, 43, 72), (42, 65, 102), (67, 98, 139), (123, 157, 188)],
    "绿色": [(20, 44, 36), (43, 67, 49), (72, 88, 57), (104, 119, 84), (153, 170, 139)],
    "棕色": [(45, 29, 24), (72, 47, 37), (103, 73, 55), (137, 101, 76), (165, 128, 98)],
    "红色": [(68, 18, 25), (105, 28, 37), (144, 42, 47), (177, 69, 67)],
    "紫色": [(48, 32, 55), (73, 45, 76), (103, 68, 105), (139, 102, 139)],
    "粉色": [(180, 112, 121), (211, 153, 159), (232, 190, 193)],
    "米色/卡其": [(119, 108, 83), (157, 143, 111), (190, 174, 139), (220, 207, 178)],
    "黄色": [(159, 130, 33), (201, 170, 54), (229, 204, 101)],
    "橙色": [(145, 73, 32), (190, 100, 43), (220, 139, 75)],
}
TEXTILE_PALETTE_LAB = {
    name: rgb_to_lab(np.asarray(values, dtype=np.float64))
    for name, values in TEXTILE_PALETTE_RGB.items()
}


def lab_label(lab: np.ndarray) -> str:
    light, a, b = map(float, lab)
    chroma = (a * a + b * b) ** 0.5
    if chroma < 5.5:
        if light < 18:
            return "黑色"
        if light > 90:
            return "白色"
        return "灰色"
    best_name = "其他"
    best_distance = float("inf")
    for name, references in TEXTILE_PALETTE_LAB.items():
        delta = references - lab
        # Hue/chroma are more important than lighting variation in photographed
        # cloth, so reduce the influence of L while matching the textile card.
        distance = np.sqrt((delta[:, 0] * 0.58) ** 2 + delta[:, 1] ** 2 + delta[:, 2] ** 2).min()
        if distance < best_distance:
            best_name, best_distance = name, float(distance)
    return best_name


def analyze(path: Path) -> dict[str, object]:
    image = Image.open(path).convert("RGB")
    w, h = image.size
    image = image.crop((int(w * 0.08), int(h * 0.08), int(w * 0.92), int(h * 0.92)))
    image.thumbnail((72, 72), Image.Resampling.LANCZOS)
    rgb = np.asarray(image, dtype=np.float64).reshape(-1, 3)
    lab = rgb_to_lab(rgb)
    centers, weights = kmeans(lab, min(5, len(lab)))
    groups: dict[str, float] = {}
    for center, weight in zip(centers, weights):
        if weight < 0.035:
            continue
        label = lab_label(center)
        groups[label] = groups.get(label, 0.0) + float(weight)
    average = np.average(rgb, axis=0)
    average_light = float(rgb_to_lab(average.reshape(1, 3))[0, 0])
    colored_thread_share = sum(
        share for name, share in groups.items()
        if name not in {"白色", "黑色", "灰色"}
    )
    # Business rule for shirtings and checks: a white ground is visually lost
    # at garment viewing distance, while the colored stripe/check defines the
    # perceived garment color. Keep pure white only when no visible color yarn
    # reaches the minimum meaningful share.
    if colored_thread_share >= 0.055:
        groups.pop("白色", None)
    # Likewise, dark gaps between yarns are texture/shadow rather than a black
    # secondary color whenever a meaningful chromatic yarn is present.
    if colored_thread_share >= 0.10 and average_light > 20:
        groups.pop("黑色", None)
    # Very dark/light texture pixels are often the gaps or highlights between
    # yarns, not an actual second fabric color. Only keep black/white when the
    # whole swatch is also genuinely dark/light.
    if average_light > 27:
        groups.pop("黑色", None)
    if average_light < 82:
        groups.pop("白色", None)
    ranked = sorted(groups.items(), key=lambda item: item[1], reverse=True)
    colors = [name for name, share in ranked if share >= 0.14]
    if colors:
        primary = colors[0]
        secondary = next((name for name in colors[1:] if name not in {"黑色", "白色"}), None)
        colors = [primary] + ([secondary] if secondary else [])
    colors = colors[:2]
    if not colors and ranked:
        colors = [ranked[0][0]]
    # A neutral secondary thread is useful for filtering mixed weaves, but tiny
    # highlight/shadow clusters are deliberately ignored above.
    hex_color = "#" + "".join(f"{int(round(v)):02x}" for v in average)
    return {"color": "+".join(colors), "colors": colors, "hex": hex_color}


def main() -> None:
    result = {path.stem: analyze(path) for path in sorted(IMAGE_DIR.glob("*.png"))}
    lines = [
        "// Generated by scripts/analyze_fabric_colors.py from the full swatch image.",
        "// Each fabric can belong to two color families when multiple yarn colors are present.",
        "export type FabricColorInfo = { color: string; colors: string[]; hex: string };",
        "export const STYLBIELLA_FABRIC_COLORS: Record<string, FabricColorInfo> = "
        + json.dumps(result, ensure_ascii=False, separators=(",", ":"))
        + ";",
        "",
    ]
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"analyzed={len(result)} output={OUTPUT}")


if __name__ == "__main__":
    main()
