# Maestro flows — piida-rn

E2E sobre la app móvil real (iOS Simulator + Android Emulator) usando
[Maestro](https://maestro.mobile.dev/). Cada flow:
1. Recibe credenciales `EMAIL`/`PASSWORD` por `--env`
2. Loguea contra `piida-back` (que debe estar corriendo en `:3000`)
3. Ejecuta el escenario contra la app instalada en el dispositivo

## Pre-requisitos

- `piida-back` corriendo en `http://localhost:3000`
- App `com.sainetapps.piidaerp` instalada y construida en el simulator/emulator
  (build dev RN local). Si Metro no corre, abrirlo aparte:
  ```bash
  npx react-native start
  ```
- Maestro instalado:
  ```bash
  curl -fsSL "https://get.maestro.mobile.dev" | bash
  # asegurar PATH:
  export PATH="$HOME/.maestro/bin:$PATH"
  ```
  Verificar: `maestro --version`

### iOS Simulator

```bash
xcrun simctl boot "iPhone 15"  # o el nombre de tu device
open -a Simulator
# (si la app no está) build+install:
npx react-native run-ios --simulator="iPhone 15"
```

### Android Emulator

```bash
emulator -list-avds            # listar AVDs disponibles
emulator -avd Pixel_7_API_34 & # arrancar uno
adb wait-for-device
npx react-native run-android   # build+install
```

> En Android la app debe apuntar al backend en `10.0.2.2:3000` (alias del
> host desde el emulador). Esto ya está en `src/api/settings.js`.

## Correr flows

El wrapper `run-flow.sh` siembra el usuario contra `piida-back` y luego
lanza `maestro test`:

```bash
# Login flow
./maestro/helpers/run-flow.sh login maestro/login-flow.yaml

# Cash flow (abrir caja → cerrar con cuadre)
./maestro/helpers/run-flow.sh cash maestro/cash-flow.yaml

# Sale flow (venta libre via keypad)
./maestro/helpers/run-flow.sh sale maestro/sale-flow.yaml
```

Si tenés más de un dispositivo activo, `--device` selecciona uno:

```bash
./maestro/helpers/run-flow.sh cash maestro/cash-flow.yaml --device "iPhone 15"
```

## Estructura

```
maestro/
├── README.md                  # este archivo
├── login-flow.yaml            # smoke: login + dashboard visible
├── cash-flow.yaml             # abrir caja → cerrar con cuadre
├── sale-flow.yaml             # venta libre via keypad → comprobante
└── helpers/
    ├── seed-user.sh           # crea user único vía API (/app_user)
    └── run-flow.sh            # wrapper: seed-user + maestro test
```

## Debug

- `maestro studio` → IDE visual para escribir/iterar flows.
- `maestro test maestro/cash-flow.yaml --debug-output ./maestro-out` →
  guarda screenshots y log de cada paso.
- Si el assert falla por texto: `maestro hierarchy` (con la app abierta)
  imprime el árbol de elementos visibles en pantalla.

## Por qué un flow YAML por escenario, no uno solo

Maestro no garantiza state isolation — si encadenamos varios tests en el
mismo flow y uno falla, los siguientes corren sobre estado corrupto. Un
flow por escenario, cada uno con `launchApp.clearState: true`, mantiene
los tests aislados igual que en Supertest.
