---
name: piida-mobile-design
description: >
  Design system de la app móvil PIIDA (piida-rn-mvp). Paleta naranja PIIDA,
  Montserrat, React Native Paper como UI kit, spacing token-based, normalizeSize
  para escalado responsive en tablets.
  Trigger: cuando se diseña, refactoriza o agrega UI en la app móvil RN —
  pantallas, componentes, forms, dialogs, listas, theming.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Refactorizar una pantalla existente al design system unificado.
- Agregar un componente nuevo (form, lista, modal, dialog).
- Sumar features que necesiten controles (botones, inputs, switches).
- Resolver inconsistencias visuales entre pantallas.

## Critical Patterns

### Stack visual oficial

- **UI kit**: `react-native-paper` v5+ (Material Design 3, theming custom).
- **Iconos**: `react-native-vector-icons` (auto-pickeado por Paper).
- **Animaciones**: `react-native-animatable` (ya instalada).
- **Responsive**: `normalizeSize(n)` de `src/styles/basicStyles.js` con cap 1.4 para tablets — usar SIEMPRE para fontSize, paddings y heights.
- **Layouts**: `Layout` de `src/layouts/` (no reemplazar, sigue siendo el wrapper raíz).

### Tokens — paleta oficial

```js
// src/styles/basicStyles.js (ya existe — NO duplicar)
colors = {
  buttonBackground: '#F7A928',  // primary (naranja PIIDA)
  inputLineFilled:  '#FFAB05',
  inputBackground:  '#F5F5F5',
  text:             '#000',
  label:            '#FF6D09',
  error:            '#FF2205',
  success:          '#16A34A',
  purplishGrey:     '#727176',
  inputPlaceholder: '#878787',
};
fonts = {
  bold:     'Montserrat-Bold',
  medium:   'Montserrat-Medium',
  regular:  'Montserrat-Regular',
  semiBold: 'Montserrat-SemiBold',
  light:    'Montserrat-Light',
};
```

### Spacing scale (token-based)

| Token | Pixels | Uso |
|---|---|---|
| `xs` | 4 | Gaps muy chicos |
| `sm` | 8 | Padding interno de chips, separación inputs |
| `md` | 16 | Padding default de cards, separación entre secciones |
| `lg` | 24 | Padding de Layout, separación de grandes bloques |
| `xl` | 32 | Solo para top/bottom de pantalla |

**Regla**: SIEMPRE multiplicar el valor por `normalizeSize()`. Ej. `padding: normalizeSize(16)` para `md`.

### Componentes — equivalencias

| En vez de... | Usar `react-native-paper` |
|---|---|
| `<TextInput>` plano | `<TextInput mode="outlined" label="..." />` |
| `<TouchableOpacity>` botón | `<Button mode="contained" />` |
| Alert.alert nativo | `<Dialog>` o `<Portal>` con `<Modal>` |
| Custom toast/banner | `<Snackbar>` |
| FAB manual | `<FAB />` |
| Lista manual con map | `<List.Item>` + `<Divider>` |
| Loader spinner | `<ActivityIndicator color={theme.colors.primary} />` |

### Theme PIIDA para Paper

Copiar este theme en `src/styles/paperTheme.js`:

```js
import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors, fonts } from './basicStyles';

const fontConfig = {
  default: { fontFamily: fonts.regular, fontWeight: '400' },
  medium:  { fontFamily: fonts.medium,  fontWeight: '500' },
  bold:    { fontFamily: fonts.bold,    fontWeight: '700' },
};

export const piidaTheme = {
  ...MD3LightTheme,
  roundness: 8,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.buttonBackground,        // naranja PIIDA
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFEDD5',
    onPrimaryContainer: '#7A2E05',
    secondary: colors.label,                 // naranja oscuro
    error: colors.error,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: colors.inputBackground,
    outline: colors.purplishGrey,
    onSurface: colors.text,
  },
};
```

Wrap en `App.js`:

```js
import { PaperProvider } from 'react-native-paper';
import { piidaTheme } from './src/styles/paperTheme';

export default function App() {
  return (
    <PaperProvider theme={piidaTheme}>
      {/* resto del árbol */}
    </PaperProvider>
  );
}
```

## Do / Don't

### DO

- Migrar componente por componente — no rewriting big bang.
- Mantener el `Layout` wrapper actual (es el shell de la pantalla).
- Usar `theme.colors.primary` en lugar de hardcodear `#F7A928` en nuevos componentes.
- Mantener Montserrat como fuente — el Paper theme la inyecta automático.
- Usar `<TextInput mode="outlined" />` (no `mode="flat"`) — outline funciona mejor con la paleta de PIIDA.
- Mantener `normalizeSize()` en cualquier dimensión hard-coded (heights, paddings).

### Gotcha — padding horizontal en pantallas migradas

El `Layout` del repo NO trae `paddingHorizontal` en su `contentContainer` — los componentes viejos lo tenían baked-in en sus styles propios. Los componentes de Paper se expanden al 100% por default, así que al migrar **siempre** envolver el contenido de la pantalla en un `<View>` con padding:

```jsx
<Layout description="...">
  <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
    {/* TextInputs, Buttons, etc. */}
  </View>
</Layout>
```

Sin eso los inputs y botones quedan flush a los bordes (raro en tablets).

### DON'T

- No instalar Tamagui ni gluestack-ui (decisión: Paper).
- No reemplazar `StyleSheet` ya escrito — migrar solo lo que tocás.
- No usar Material colors por default (`MD3LightTheme.colors.primary` es morado).
- No hardcodear `Platform.select` para diferenciar iOS/Android — Paper ya hace lo correcto por defecto.
- No usar `<TouchableOpacity>` para crear botones nuevos — usar `<Button />` de Paper.
- No agregar dark mode todavía (no es prioridad y duplica testing).

## Code Examples

### Form input migrado

ANTES:
```jsx
<View style={styles.inputCont}>
  <Text style={styles.label}>Email</Text>
  <TextInput
    style={styles.input}
    placeholder="correo@piida.co"
    onChangeText={onChange}
    value={value}
  />
  {error && <Text style={styles.errorText}>{error}</Text>}
</View>
```

DESPUÉS:
```jsx
import { TextInput, HelperText } from 'react-native-paper';

<View>
  <TextInput
    mode="outlined"
    label="Email"
    placeholder="correo@piida.co"
    value={value}
    onChangeText={onChange}
    keyboardType="email-address"
    autoCapitalize="none"
    error={!!error}
  />
  <HelperText type="error" visible={!!error}>
    {error}
  </HelperText>
</View>
```

### Botón primario

ANTES:
```jsx
<TouchableOpacity style={styles.button} onPress={onPress}>
  <Text style={styles.buttonText}>Iniciar sesión</Text>
</TouchableOpacity>
```

DESPUÉS:
```jsx
import { Button } from 'react-native-paper';

<Button
  mode="contained"
  onPress={onPress}
  loading={loading}
  disabled={loading || !valid}
>
  Iniciar sesión
</Button>
```

### Dialog

ANTES (custom dialog):
```jsx
<Modal visible={visible}>
  <View style={styles.dialogCont}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{message}</Text>
    <TouchableOpacity onPress={onAccept}>
      <Text>OK</Text>
    </TouchableOpacity>
  </View>
</Modal>
```

DESPUÉS:
```jsx
import { Dialog, Portal, Button, Text } from 'react-native-paper';

<Portal>
  <Dialog visible={visible} onDismiss={onClose}>
    <Dialog.Title>{title}</Dialog.Title>
    <Dialog.Content>
      <Text variant="bodyMedium">{message}</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onClose}>Cancelar</Button>
      <Button onPress={onAccept}>Aceptar</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

## Commands

```bash
# Instalar
cd /Users/sainetapps/Projects/piida-rn-mvp
npm install --legacy-peer-deps react-native-paper react-native-vector-icons react-native-safe-area-context
# (react-native-safe-area-context ya está; -vector-icons es necesario para íconos de Paper)

# Linkear vector-icons en Android — agregar a android/app/build.gradle (al final):
# apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")

# Linkear vector-icons en iOS — Info.plist UIAppFonts (postergado, app es Android-only por ahora)

# Rebuild Android
cd android && ./gradlew assembleRelease
```

## Resources

- **Templates**: See [assets/](assets/) for el archivo `paperTheme.js` listo para copiar a `src/styles/`.
- **Documentation**: react-native-paper docs (externa): https://callstack.github.io/react-native-paper/
