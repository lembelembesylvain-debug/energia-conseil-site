"""Export BAT A4 du flyer NOMOS."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
html = root / "templates" / "marketing" / "nomos" / "flyer_A4_nomos.html"
out = root / "templates" / "marketing" / "nomos" / "flyer_A4_nomos.pdf"
url = html.resolve().as_uri()

candidates = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]
browser = next((p for p in candidates if p.is_file()), None)
if not browser:
    print("Navigateur introuvable", file=sys.stderr)
    sys.exit(1)

cmd = [
    str(browser),
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--font-render-hinting=none",
    "--virtual-time-budget=12000",
    f"--print-to-pdf={out}",
    url,
]
print(" ".join(cmd))
subprocess.run(cmd, check=True)
print("PDF", out, "size", out.stat().st_size if out.is_file() else 0)
