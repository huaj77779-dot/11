from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "public" / "brand"
SOURCES = (
    "custom-cutting-process.png",
    "advantage-one-piece-v2.png",
    "advantage-four-layers.png",
    "advantage-white-label.png",
    "advantage-reorder.png",
    "quality-china-01.png",
    "quality-china-02.png",
    "quality-china-03.png",
    "quality-china-04.png",
)


def optimize(source: Path) -> None:
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        has_alpha = image.mode == "RGBA" or "transparency" in image.info
        converted = image.convert("RGBA" if has_alpha else "RGB")
        converted.save(target, "WEBP", quality=82, method=6)
    print(f"{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes")


if __name__ == "__main__":
    for filename in SOURCES:
        optimize(ROOT / filename)
