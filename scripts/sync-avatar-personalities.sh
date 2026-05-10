#!/usr/bin/env bash
#
# sync-avatar-personalities.sh
#
# Reads the three personality files in data/personalities/ and PATCHes the
# corresponding Runway avatars with the latest text. Use after editing any
# personality file (e.g. after research-driven rubric updates) so the live
# avatars match the repo.
#
# Usage:
#   ./scripts/sync-avatar-personalities.sh                  # patch all 3
#   ./scripts/sync-avatar-personalities.sh workplace_empathy_001  # patch one
#
# Requires:
#   - RUNWAY_SKILLS_API_SECRET in env (or a saved key the runway-api skill knows)
#   - jq, curl, node 20+
#   - The runway-api skill installed at one of the standard locations
#

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PERSONALITY_DIR="$PROJECT_ROOT/data/personalities"

# Resolve the runway-api skill script
RW_SCRIPT=""
for candidate in \
  "$HOME/.claude/plugins/cache/claude-community/runway-api-skills/2.1.0/skills/use-runway-api/scripts/runway-api.mjs" \
  "$HOME/.claude/plugins/cache/claude-community/runway-api-skills/"*/skills/use-runway-api/scripts/runway-api.mjs \
  "${RUNWAY_SKILLS_DIR:-}/skills/use-runway-api/scripts/runway-api.mjs"; do
  if [ -f "$candidate" ]; then
    RW_SCRIPT="$candidate"
    break
  fi
done

if [ -z "$RW_SCRIPT" ]; then
  echo "ERROR: runway-api skill script not found" >&2
  exit 1
fi

if [ -z "${RUNWAY_SKILLS_CLIENT_ID:-}" ]; then
  export RUNWAY_SKILLS_CLIENT_ID=$(node -e "console.log(crypto.randomUUID())")
fi

# Scenario id → avatar id mapping. Keep in sync with app/lib/scenarios.ts.
declare -a SCENARIOS=(
  "workplace_empathy_001:e6c8e3f2-ae0b-4aeb-98c8-ea217a2d3827"
  "school_self_advocacy_001:d17acfff-2aae-44db-bbb8-8d75118383d2"
  "interview_prep_001:576d0934-f203-41b1-b33e-0f47d82eeec5"
)

filter_scenario="${1:-}"

for entry in "${SCENARIOS[@]}"; do
  scenario_id="${entry%%:*}"
  avatar_id="${entry##*:}"

  if [ -n "$filter_scenario" ] && [ "$scenario_id" != "$filter_scenario" ]; then
    continue
  fi

  personality_file="$PERSONALITY_DIR/$scenario_id.txt"
  if [ ! -f "$personality_file" ]; then
    echo "skip $scenario_id — no personality file at $personality_file" >&2
    continue
  fi

  echo "patching $scenario_id ($avatar_id) from $personality_file..."

  body=$(jq -n --rawfile personality "$personality_file" '{personality: $personality}')

  result=$(echo "$body" | node "$RW_SCRIPT" request PATCH "/v1/avatars/$avatar_id" --stdin 2>&1)
  echo "$result" | jq -r '"  → status: \(.status // "unknown")  voice: \(.voice.presetId // "?")  updatedAt: \(.updatedAt // "?")"'
done

echo "done."
