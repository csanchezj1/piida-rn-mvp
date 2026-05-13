#!/usr/bin/env bash
# Crea un usuario de prueba contra piida-back y exporta sus credenciales.
# Imprime EMAIL y PASSWORD que el flow YAML consume vía --env.
#
# Uso:
#   eval "$(./maestro/helpers/seed-user.sh cash)"
#   maestro test maestro/cash-flow.yaml --env "EMAIL=$EMAIL" --env "PASSWORD=$PASSWORD"
#
# o con el wrapper run-flow.sh:
#   ./maestro/helpers/run-flow.sh cash maestro/cash-flow.yaml

set -e

LABEL="${1:-mvp}"
BACKEND_URL="${PIIDA_BACK_URL:-http://localhost:3000}"
MAGIC_AUTH="$(printf 'rest_api:Xk=ryoDuX^D1' | base64)"

UNIQUE="$(date +%s)$RANDOM"
EMAIL="m_${LABEL}_${UNIQUE}@test.co"
PASSWORD="MaestroTest123"

RESPONSE=$(curl -s -X POST "$BACKEND_URL/app_user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic ${MAGIC_AUTH}" \
  -d "{\"type\":\"create\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"name\":\"Maestro ${LABEL}\",\"company_name\":\"MaestroCo ${UNIQUE}\"}")

if ! echo "$RESPONSE" | grep -q '"registered":true'; then
  echo "ERROR: no se pudo crear el usuario. Respuesta:" >&2
  echo "$RESPONSE" >&2
  exit 1
fi

# Salida formato shell-eval
echo "EMAIL=\"$EMAIL\""
echo "PASSWORD=\"$PASSWORD\""
