#!/usr/bin/env bash
# Wrapper específico para el flow multi-sucursal: siembra user con 2 branches
# y corre el YAML pasando todas las env vars.
#
# Uso:
#   ./maestro/helpers/run-multi-sucursal.sh maestro/multi-sucursal-flow.yaml [device-args...]
#   ./maestro/helpers/run-multi-sucursal.sh maestro/multi-sucursal-flow.yaml --device emulator-5554

set -e

if [ $# -lt 1 ]; then
  echo "Uso: $0 <flow-file> [device-args...]" >&2
  exit 1
fi

FLOW="$1"
shift

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
eval "$(bash "$SCRIPT_DIR/seed-user-with-branches.sh" "multibranch")"

echo "▶ Corriendo $FLOW como $EMAIL (sucursal extra: $BRANCH_B_NAME)"
maestro test "$FLOW" \
  --env "EMAIL=$EMAIL" \
  --env "PASSWORD=$PASSWORD" \
  --env "BRANCH_B_NAME=$BRANCH_B_NAME" \
  "$@"
