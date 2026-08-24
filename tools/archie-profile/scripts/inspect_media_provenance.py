#!/usr/bin/env python3
"""Record available machine-readable provenance evidence for downloaded public assets.

The result deliberately distinguishes no metadata from no AI use. C2PA support
is enabled only when the official c2patool binary is installed.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("asset", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not args.asset.is_file():
        raise SystemExit(f"Asset not found: {args.asset}")

    result: dict[str, object] = {
        "asset": str(args.asset),
        "status": "needs_confirmation",
        "meaning": "No conclusion about whether this asset was AI-generated has been made.",
        "checks": [],
    }
    c2patool = shutil.which("c2patool")
    if c2patool:
        completed = subprocess.run([c2patool, str(args.asset)], text=True, capture_output=True, check=False)
        result["checks"].append({"tool": "c2patool", "exit_code": completed.returncode, "stdout": completed.stdout, "stderr": completed.stderr})
        if completed.returncode == 0 and completed.stdout.strip():
            result["status"] = "provenance_present"
            result["meaning"] = "A C2PA manifest was returned. Its claims still need interpretation and validation context."
    else:
        result["checks"].append({"tool": "c2patool", "status": "not_installed"})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
