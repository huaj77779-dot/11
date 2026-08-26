from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image


def load_desharp(skill_script: Path):
    spec = importlib.util.spec_from_file_location("stylbiella_crop_swatches", skill_script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {skill_script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.desharp


def find_abrupt_white_lower_edge(path: Path) -> int | None:
    with Image.open(path) as source:
        image = source.convert("RGB")
    array = np.asarray(image)
    height = array.shape[0]
    white_share = (array.min(axis=2) >= 230).mean(axis=1)
    luminance = array.mean(axis=2)
    upper_mean = luminance[:max(1, int(height * 0.4))].mean()
    start = max(2, int(height * 0.45))
    for row in range(start, height - 2):
        before = white_share[max(0, row - 3):row].mean()
        after = white_share[row:min(height, row + 3)].mean()
        if before < 0.45 and after > 0.65 and upper_mean < 205:
            return row
    lower_mean = luminance[int(height * 0.82):].mean()
    label_contrast = upper_mean < 205 and lower_mean > 215 and lower_mean - upper_mean > 25
    if label_contrast:
        changes = np.diff(white_share)
        return int(np.argmax(changes[start:]) + start + 1)
    return None


def strongest_lower_white_transition(path: Path) -> int:
    with Image.open(path) as source:
        array = np.asarray(source.convert("RGB"))
    height = array.shape[0]
    white_share = (array.min(axis=2) >= 230).mean(axis=1)
    start = max(2, int(height * 0.45))
    changes = np.diff(white_share)
    return int(np.argmax(changes[start:]) + start + 1)


def crop_above_pinked_edge(path: Path, edge_row: int) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGB")
    width, height = image.size
    # Stop above the tallest tooth and trim a small amount from the other
    # edges, preserving the weave without blur, resampling, or recolouring.
    safety = max(12, round(height * 0.035))
    side_inset = max(2, round(width * 0.01))
    top_inset = max(2, round(height * 0.01))
    bottom = max(top_inset + 20, edge_row - safety)
    return image.crop((side_inset, top_inset, width - side_inset, bottom))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_dir", type=Path)
    parser.add_argument("skill_script", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--codes", nargs="*")
    args = parser.parse_args()

    if args.codes:
        candidates = [
            (args.image_dir / f"{code}.png", strongest_lower_white_transition(args.image_dir / f"{code}.png"))
            for code in args.codes
        ]
    else:
        candidates = sorted(
            (path, edge_row)
            for path in args.image_dir.glob("*.png")
            if (edge_row := find_abrupt_white_lower_edge(path)) is not None
        )
    print(f"candidates={len(candidates)}")
    print(" ".join(f"{path.stem}@{edge_row}" for path, edge_row in candidates))
    if not args.apply:
        return

    for path, edge_row in candidates:
        fixed = crop_above_pinked_edge(path, edge_row)
        fixed.save(path)
    print(f"fixed={len(candidates)}")


if __name__ == "__main__":
    main()
