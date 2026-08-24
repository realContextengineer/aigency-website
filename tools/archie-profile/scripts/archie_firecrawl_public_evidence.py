#!/usr/bin/env python3
"""Start a bounded Firecrawl job for a validated public Archie review.

This runner exists so Archie uses one explicit credential and one audit contract.
It deliberately omits search, interaction, form filling, authentication and
third-party crawling.
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
import socket
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
JOBS = ROOT / "workspace" / "jobs"
API_ROOT = "https://api.firecrawl.dev/v2"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", help="The validated public website root URL")
    parser.add_argument("--job-id", required=True, help="An Archie job id, e.g. archie-20260815-001")
    parser.add_argument("--page-limit", type=int, default=25, help="Hard maximum: 25 pages")
    parser.add_argument("--poll-seconds", type=int, default=5)
    parser.add_argument("--wait-seconds", type=int, default=180)
    return parser.parse_args()


def validate_public_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("A plain public http(s) URL is required")
    host = parsed.hostname.rstrip(".").lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise ValueError("Local addresses are not eligible for an Archie public review")
    try:
        literal = ipaddress.ip_address(host)
        addresses = [literal]
    except ValueError:
        addresses = [ipaddress.ip_address(item[4][0]) for item in socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)]
    if not addresses or any(not address.is_global for address in addresses):
        raise ValueError("The target must resolve exclusively to globally routable addresses")
    return parsed.geturl()


def request_api(path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        raise RuntimeError("Archie's FIRECRAWL_API_KEY is not configured in her private profile .env")
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"{API_ROOT}{path}",
        data=data,
        method="POST" if payload is not None else "GET",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "AiGENCY-Archie-PublicEvidence/1.0"},
    )
    try:
        with urlopen(request, timeout=60) as response:  # nosec B310: endpoint is constant
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:2000]
        raise RuntimeError(f"Firecrawl returned HTTP {error.code}: {detail}") from error


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    args = parse_args()
    url = validate_public_url(args.url)
    if not 1 <= args.page_limit <= 25:
        raise SystemExit("page-limit must be between 1 and 25")
    if not args.job_id.replace("-", "").replace("_", "").isalnum():
        raise SystemExit("job-id may contain letters, numbers, hyphens and underscores only")

    job_dir = JOBS / args.job_id
    if job_dir.exists():
        raise SystemExit(f"Job id already exists: {args.job_id}")
    job_dir.mkdir(parents=True)
    host = urlparse(url).hostname
    started_at = datetime.now(timezone.utc).isoformat()
    request_contract = {
        "job_id": args.job_id,
        "requested_url": url,
        "same_domain_only": True,
        "page_limit": args.page_limit,
        "prohibited": ["search", "interact", "authentication", "form submission", "purchases", "third-party crawling"],
        "started_at": started_at,
    }
    write_json(job_dir / "job-contract.json", request_contract)

    # The job requests public evidence surfaces: source text, raw markup,
    # outgoing links, asset URLs and a full-page screenshot. No browser actions.
    payload = {
        "url": url,
        "limit": args.page_limit,
        "maxDiscoveryDepth": 2,
        "allowExternalLinks": False,
        "allowBackwardLinks": False,
        "sitemap": "include",
        "scrapeOptions": {
            "formats": ["markdown", "rawHtml", "links", "images", {"type": "screenshot", "fullPage": True, "quality": 80, "viewport": {"width": 1440, "height": 1000}}],
            "onlyMainContent": False,
            "blockAds": True,
            "removeBase64Images": True,
            "proxy": "auto",
        },
    }
    created = request_api("/crawl", payload)
    write_json(job_dir / "firecrawl-start.json", created)
    crawl_id = created.get("id") or created.get("jobId")
    if not crawl_id:
        raise RuntimeError("Firecrawl did not return a crawl id")

    deadline = time.monotonic() + args.wait_seconds
    latest: dict[str, Any] = created
    while time.monotonic() < deadline:
        time.sleep(args.poll_seconds)
        latest = request_api(f"/crawl/{crawl_id}")
        write_json(job_dir / "firecrawl-status.json", latest)
        status = str(latest.get("status", "")).lower()
        if status in {"completed", "failed", "cancelled"}:
            break

    summary = {
        "job_id": args.job_id,
        "crawl_id": crawl_id,
        "target_host": host,
        "status": latest.get("status", "pending"),
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "result_file": str(job_dir / "firecrawl-status.json"),
    }
    write_json(job_dir / "job-summary.json", summary)
    print(json.dumps(summary, indent=2))
    if str(summary["status"]).lower() not in {"completed", "pending", "processing", "scraping"}:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
