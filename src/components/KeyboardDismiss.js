import React from 'react';
import {Keyboard, TouchableWithoutFeedback, View} from 'react-native';

/**
 * Wrapper que cierra el teclado al tocar fuera de inputs/botones. Útil en
 * pantallas con muchos TextInput donde el cajero suele tocar fuera del
 * campo y quiere que el teclado desaparezca automáticamente.
 *
 * Uso:
 *   <KeyboardDismiss>
 *     <Tu UI...>
 *   </KeyboardDismiss>
 *
 * - accessible=false en el TouchableWithoutFeedback para que el screen
 *   reader no interprete el wrap completo como un botón.
 * - View con flex:1 hereda el espacio del padre — sin esto el contenido
 *   colapsa cuando el padre es flex container.
 */
const KeyboardDismiss = ({children, style}) => (
  <TouchableWithoutFeedback accessible={false} onPress={() => Keyboard.dismiss()}>
    <View style={[{flex: 1}, style]}>{children}</View>
  </TouchableWithoutFeedback>
);

export default KeyboardDismiss;
