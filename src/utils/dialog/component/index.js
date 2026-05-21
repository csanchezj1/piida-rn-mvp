import React, {Component} from 'react';
import {Button, Dialog, Portal, Text} from 'react-native-paper';

class CommonDialog extends Component {
  onAccept = () => {
    // Siempre cerramos el dialog ANTES de ejecutar la acción, para que
    // el dialog no quede tapando la pantalla siguiente al navegar.
    this.props.actions.visible(false);
    if (this.props.acceptAction) {
      this.props.acceptAction();
    }
  };
  onDismiss = () => this.props.actions.visible(false);

  render() {
    return (
      <Portal>
        <Dialog
          visible={!!this.props.visible}
          onDismiss={this.onDismiss}
          // maxWidth + alignSelf evita que el Dialog se estire en tablets
          // (sin esto Paper le da ~95% del ancho de la pantalla).
          style={{maxWidth: 440, alignSelf: 'center', width: '100%'}}>
          {this.props.title ? <Dialog.Title>{this.props.title}</Dialog.Title> : null}
          <Dialog.Content>
            <Text variant="bodyMedium">{this.props.message || ''}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {/* "Cancelar" solo cuando el caller pide explícitamente botón
                cancelar (showCancelButton). Antes se renderizaba siempre que
                cancelTitle tuviera valor — y el reducer lo seteaba a 'Cancelar'
                por default, así que aparecía en cada diálogo informativo. */}
            {this.props.showCancelButton ? (
              <Button onPress={this.onDismiss}>
                {this.props.cancelTitle || 'Cancelar'}
              </Button>
            ) : null}
            <Button onPress={this.onAccept}>
              {this.props.acceptTitle || 'Aceptar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
}

export default CommonDialog;
