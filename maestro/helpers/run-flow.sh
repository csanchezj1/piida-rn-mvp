#!/usr/bin/env bash
# Wrapper: crea usuario de prueba contra piida-back y corre el flow Maestro.
#
# Uso:
#   ./maestro/helpers/run-flow.sh <label> <flow-file> [device-args...]
#
# Ejemplos:
#   ./maestro/helpers/run-flow.sh cash maestro/cash-flow.yaml
#   ./maestro/helpers/run-flow.sh sale maestro/sale-flow.yaml --device "iPhone 15"

set -e

if [ $# -lt 2 ]; then
  echo "Uso: $0 <label> <flow-file> [device-args...]" >&2
  exit 1
fi

LABEL="$1"
FLOW="$2"
shift 2

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
eval "$(bash "$SCRIPT_DIR/seed-user.sh" "$LABEL")"

echo "▶ Corriendo $FLOW como $EMAIL"
maestro test "$FLOW" \
  --env "EMAIL=$EMAIL" \
  --env "PASSWORD=$PASSWORD" \
  "$@"
