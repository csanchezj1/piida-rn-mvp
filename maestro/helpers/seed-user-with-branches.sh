#!/usr/bin/env bash
# Crea un usuario admin + una segunda sucursal (vía POST /api/v2/branches).
# Imprime EMAIL/PASSWORD/BRANCH_A_NAME/BRANCH_B_NAME en formato shell-eval.
#
# Uso:
#   eval "$(./maestro/helpers/seed-user-with-branches.sh switcher)"
#   maestro test maestro/multi-sucursal-flow.yaml \
#     --env "EMAIL=$EMAIL" --env "PASSWORD=$PASSWORD" --env "BRANCH_B_NAME=$BRANCH_B_NAME"

set -e

LABEL="${1:-multibranch}"
BACKEND_URL="${PIIDA_BACK_URL:-http://localhost:3000}"
MAGIC_AUTH_B64="$(printf 'rest_api:Xk=ryoDuX^D1' | base64)"

UNIQUE="$(date +%s)$RANDOM"
EMAIL="m_${LABEL}_${UNIQUE}@test.co"
PASSWORD="MaestroTest123"
BRANCH_B_NAME="Sucursal Switch ${UNIQUE}"

REGISTER_RESPONSE=$(/usr/bin/curl -s -X POST "$BACKEND_URL/app_user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ${MAGIC_AUTH_B64}" \
  -d "{\"type\":\"create\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"name\":\"Maestro ${LABEL}\",\"company_name\":\"MaestroCo ${UNIQUE}\"}")

if ! echo "$REGISTER_RESPONSE" | grep -q '"registered":true'; then
  echo "ERROR: no se pudo registrar usuario. Response:" >&2
  echo "$REGISTER_RESPONSE" >&2
  exit 1
fi

# Crear segunda sucursal usando Basic con email:password del user real
USER_AUTH_B64="$(printf '%s' "${EMAIL}:${PASSWORD}" | base64)"
BRANCH_RESPONSE=$(/usr/bin/curl -s -X POST "$BACKEND_URL/api/v2/branches" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ${USER_AUTH_B64}" \
  -d "{\"name\":\"${BRANCH_B_NAME}\"}")

if ! echo "$BRANCH_RESPONSE" | grep -q '"id"'; then
  echo "ERROR: no se pudo crear la segunda sucursal. Response:" >&2
  echo "$BRANCH_RESPONSE" >&2
  exit 1
fi

echo "EMAIL=\"$EMAIL\""
echo "PASSWORD=\"$PASSWORD\""
echo "BRANCH_B_NAME=\"$BRANCH_B_NAME\""
