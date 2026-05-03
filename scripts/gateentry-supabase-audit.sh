#!/usr/bin/env bash
set -e

echo "Checking Gate Entry dashboard for legacy backend API endpoint usage..."
grep -R --line-number --exclude-dir=node_modules -E "axios\.|fetch\(|API_BASE|BACKEND_BASE_URL|/api/" src/dashboards/GateEntryDashboard.jsx || true

echo
legacy_found=false
for fn in scanGateEntryTicket issueWristband getGateEntryLogs; do
  echo "Checking service function: $fn"
  block=$(awk -v fn="$fn" '
    $0 ~ "export async function " fn { inblock=1 }
    inblock { print }
    inblock && $0 ~ /^export async function / && $0 !~ "export async function " fn { exit }
  ' src/services/api.js)

  echo "$block" | grep -nE "axios\.|fetch\(|API_BASE|BACKEND_BASE_URL|/api/" || true
  if echo "$block" | grep -qE "axios\.|fetch\(|API_BASE|BACKEND_BASE_URL|/api/"; then
    legacy_found=true
  fi
  echo
done

if [ "$legacy_found" = true ]; then
  echo "Legacy backend endpoint usage found in Gate Entry service functions. Please replace those calls with Supabase logic."
else
  echo "No legacy backend endpoint usage found in Gate Entry dashboard and service functions."
fi

echo
cat <<'EOF'
Gate Entry dashboard uses the following Supabase service functions:
- scanGateEntryTicket(ticketId, accessCode, eventId)
- issueWristband(ticketId, wristbandNumber)
- getGateEntryLogs(eventId)

Run this script with:
  ./scripts/gateentry-supabase-audit.sh

If you want to verify the full app, also run:
  npm run supabase:migrate
EOF
