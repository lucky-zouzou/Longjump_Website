"""Package the current website source and local assets, without tool caches."""
from datetime import date
from pathlib import Path
import json
import sys
import zipfile

root = Path(__file__).resolve().parent.parent
archive = root / "output" / f"LOONG_JUMP独立站_电脑平板手机适配版_{date.today():%Y%m%d}.zip"
if len(sys.argv) > 1:
    archive = Path(sys.argv[1]).resolve()
archive.parent.mkdir(exist_ok=True)
if archive.exists():
    raise SystemExit(f"Archive already exists; keep it and choose a new filename: {archive}")
folders = {"app", "components", "hooks", "lib", "public", "scripts", "docs", "db", "drizzle"}
root_files = {
    "README.md", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml",
    "next.config.ts", "next-env.d.ts", "tsconfig.json", "vite.config.ts",
    "components.json", ".gitignore", ".oxfmtrc.json", ".oxlintrc.json",
    ".openai/hosting.json", "drizzle.config.ts", "cloudflare-env.d.ts",
}
entries = [(root / name, name) for name in sorted(root_files) if (root / name).is_file()]
for folder in sorted(folders):
    for path in sorted((root / folder).rglob("*")):
        if path.is_file() and not path.is_symlink() and path.name != ".DS_Store" and not path.name.startswith(".env"):
            entries.append((path, str(path.relative_to(root))))
qa = root / "output" / "responsive-qa"
if qa.exists():
    for path in sorted(qa.iterdir()):
        if path.suffix in {".png", ".json"}:
            entries.append((path, "设备预览/" + path.name))
with zipfile.ZipFile(archive, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as package:
    for path, name in entries:
        package.write(path, "LOONG_JUMP-website/" + name)
with zipfile.ZipFile(archive) as package:
    assert package.testzip() is None
    for required in ["app/responsive.css", ".openai/hosting.json", "components/hero-film.tsx", "public/videos/loong-jump-brand-film.mp4"]:
        assert "LOONG_JUMP-website/" + required in package.namelist(), required
print(json.dumps({"archive": str(archive), "files": len(entries), "size_mb": round(archive.stat().st_size / 1048576, 1), "verified": True}, ensure_ascii=False))
