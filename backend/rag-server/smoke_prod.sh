#!/usr/bin/env bash
# Post-deploy smoke test against the LIVE stack. Catches the class of failure that
# shipped silently before (broken PDF ingest → generic error): it uploads a REAL
# PDF and asks a real question, asserting a grounded answer — not a masked error.
#
# Usage:
#   ./smoke_prod.sh                 # uses defaults below
#   PDF=/path/to/file.pdf ./smoke_prod.sh
# Requires: curl, python3 (for JSON parsing). No secrets — registers a throwaway user.
set -euo pipefail

API="${API:-https://ai-document-rag-api.onrender.com/api/v1}"
RAG="${RAG:-https://ai-document-rag-server.onrender.com}"
PDF="${PDF:-fixtures/sample.pdf}"
GENERIC_ERR="The document service could not process this request."

fail() { echo "❌ SMOKE FAIL: $*" >&2; exit 1; }
jqpy() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

[ -f "$PDF" ] || fail "test PDF not found: $PDF"

# Unique throwaway user (no Date.now in bash issues — $RANDOM is fine here).
EMAIL="smoke_${RANDOM}${RANDOM}@example.com"
PASS="password123"

echo "→ Warming + registering $EMAIL (cold start may take ~60s)…"
TOKEN=$(curl -fsS --max-time 120 --retry 3 --retry-all-errors \
  -X POST "$API/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Smoke\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  | jqpy "d['token']") || fail "register failed"
[ -n "$TOKEN" ] || fail "no token from register"
echo "  ✓ registered, got token"

echo "→ Uploading $PDF via Spring proxy…"
UP=$(curl -fsS --max-time 180 \
  -X POST "$API/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$PDF") || fail "upload failed (HTTP error)"
CHUNKS=$(echo "$UP" | jqpy "d.get('chunks', -1)")
echo "  server reported chunks=$CHUNKS"
# The bug produced HUNDREDS of garbage chunks for this ~0.5MB PDF; clean is tens.
[ "$CHUNKS" -ge 1 ] 2>/dev/null || fail "no chunks indexed: $UP"
[ "$CHUNKS" -lt 200 ] 2>/dev/null || fail "absurd chunk count $CHUNKS — raw-bytes fallback? (pandas/readers broken)"
echo "  ✓ indexed cleanly ($CHUNKS chunks)"

echo "→ Asking a grounded question…"
ANS=$(curl -fsS --max-time 120 \
  -X POST "$API/chat-bot/ask/agent" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"What is the maximum maternity benefit amount?","topK":5}' \
  | jqpy "d.get('answer','')") || fail "ask failed"
echo "  answer: ${ANS:0:120}…"
[ -n "$ANS" ] || fail "empty answer"
case "$ANS" in
  *"$GENERIC_ERR"*) fail "got the generic masked error — ingest is broken again" ;;
esac
echo "✅ SMOKE PASS — real PDF ingested and answered end-to-end."
