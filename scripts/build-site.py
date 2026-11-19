#!/usr/bin/env python3
"""Rebuild Pages from the default branch and current eligible pull request heads."""
import json
import os
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path.cwd()
SITE = ROOT / "site"
BASE = os.environ.get("TOOLBOX_ROOT", "/pmg-digital-toolbox/")
REPOSITORY = os.environ["GITHUB_REPOSITORY"]


def build(source, destination, base, channel, version):
    environment = os.environ.copy()
    environment.pop("GH_TOKEN", None)
    environment.update(DEPLOY_BASE=base, VITE_TOOLBOX_ROOT=BASE,
                       VITE_TOOLBOX_CHANNEL=channel, VITE_TOOLBOX_VERSION=version)
    subprocess.run(["npm", "ci"], cwd=source, env=environment, check=True)
    subprocess.run(["npm", "run", "build"], cwd=source, env=environment, check=True)
    shutil.copytree(source / "dist", destination)


def main():
    if not BASE.startswith("/") or not BASE.endswith("/") or ".." in BASE:
        raise ValueError("TOOLBOX_ROOT must be an absolute path ending in /")
    shutil.rmtree(SITE, ignore_errors=True)
    build(ROOT, SITE, BASE, "stable", "main")
    response = subprocess.check_output(
        ["gh", "api", "--paginate", "--slurp", f"repos/{REPOSITORY}/pulls?state=open&per_page=100"], text=True
    )
    pulls = [pull for page in json.loads(response) for pull in page]
    versions = [{"id": "main", "label": "Stable (master)", "channel": "stable", "basePath": BASE}]
    with tempfile.TemporaryDirectory() as temporary:
        for pull in sorted(pulls, key=lambda item: item["number"]):
            if pull["head"]["repo"] is None or pull["head"]["repo"]["full_name"].lower() != REPOSITORY.lower():
                continue
            number = pull["number"]
            version = f"pr-{number}"
            source = pathlib.Path(temporary) / version
            destination = SITE / "previews" / version
            try:
                subprocess.run(["git", "clone", "--quiet", "--no-checkout", f"https://github.com/{REPOSITORY}.git", str(source)], check=True)
                subprocess.run(["git", "fetch", "--quiet", "origin", f"refs/pull/{number}/head"], cwd=source, check=True)
                subprocess.run(["git", "checkout", "--quiet", "--detach", pull["head"]["sha"]], cwd=source, check=True)
                build(source, destination, f"{BASE}previews/{version}/", "preview", version)
            except subprocess.CalledProcessError as error:
                print(f"::warning::Preview {version} failed: {error}", flush=True)
                shutil.rmtree(destination, ignore_errors=True)
                continue
            versions.append({"id": version, "label": f"PR #{number} — {pull['title']}",
                             "channel": "preview", "basePath": f"{BASE}previews/{version}/"})
    (SITE / "versions.json").write_text(json.dumps({"versions": versions}, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
