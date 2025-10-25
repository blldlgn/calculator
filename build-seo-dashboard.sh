#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./build-seo-dashboard.sh \
#     --site-url "https://www.example.com" \
#     --brand-name "Example" \
#     --primary "#1E88E5" --secondary "#1565C0" --accent "#43A047" --background "#F8FAFC" \
#     --font "Inter" \
#     --ga4 "123456789" \
#     --web-vitals-endpoint "https://api.example.com/vitals" \
#     --out seo-dashboard.json

SITE_URL=""
BRAND_NAME="SEO"
COLOR_PRIMARY="#1E88E5"
COLOR_SECONDARY="#1565C0"
COLOR_ACCENT="#43A047"
COLOR_BACKGROUND="#F8FAFC"
FONT="Inter"
GA4_PROPERTY_ID=""
WEB_VITALS_ENDPOINT=""
OUT_FILE="seo-dashboard.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --site-url) SITE_URL="$2"; shift 2 ;;
    --brand-name) BRAND_NAME="$2"; shift 2 ;;
    --primary) COLOR_PRIMARY="$2"; shift 2 ;;
    --secondary) COLOR_SECONDARY="$2"; shift 2 ;;
    --accent) COLOR_ACCENT="$2"; shift 2 ;;
    --background) COLOR_BACKGROUND="$2"; shift 2 ;;
    --font) FONT="$2"; shift 2 ;;
    --ga4) GA4_PROPERTY_ID="$2"; shift 2 ;;
    --web-vitals-endpoint) WEB_VITALS_ENDPOINT="$2"; shift 2 ;;
    --out) OUT_FILE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$SITE_URL" ]]; then
  echo "--site-url is required" >&2
  exit 1
fi

TEMPLATE="/workspace/seo-dashboard.template.json"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Template not found at $TEMPLATE" >&2
  exit 1
fi

# Render template with a robust Python replacer that supports ${VAR} and ${VAR:=default}
export SITE_URL BRAND_NAME COLOR_PRIMARY COLOR_SECONDARY COLOR_ACCENT COLOR_BACKGROUND FONT GA4_PROPERTY_ID WEB_VITALS_ENDPOINT
export TEMPLATE OUT_FILE

PYTHON_BIN="$(command -v python3 || true)"
if [[ -z "$PYTHON_BIN" ]]; then
  PYTHON_BIN="$(command -v python || true)"
fi

if [[ -n "$PYTHON_BIN" ]]; then
  "$PYTHON_BIN" - "$TEMPLATE" "$OUT_FILE" <<'PYCODE' > /dev/null
import os, re, sys, json
template_path = sys.argv[1]
out_file = sys.argv[2]
with open(template_path, 'r', encoding='utf-8') as f:
    s = f.read()
pattern = re.compile(r"\$\{([A-Z0-9_]+)(?::=([^}]*))?\}")
def repl(m):
    var = m.group(1)
    default = m.group(2)
    val = os.environ.get(var, None)
    if val is None or val == "":
        val = default if default is not None else ""
    return val
rendered = pattern.sub(repl, s)
try:
    obj = json.loads(rendered)
except json.JSONDecodeError as e:
    sys.stderr.write(f"JSON error: {e}\n")
    with open(out_file, 'w', encoding='utf-8') as w:
        w.write(rendered)
    sys.exit(1)
with open(out_file, 'w', encoding='utf-8') as w:
    json.dump(obj, w, ensure_ascii=False, indent=2)
PYCODE
else
  echo "Python is required to render the template. Please install python3." >&2
  exit 1
fi

# Basic JSON validity check already performed by Python

echo "Wrote $OUT_FILE"
