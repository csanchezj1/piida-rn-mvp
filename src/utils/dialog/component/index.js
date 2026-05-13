import React, {Component} from 'react';
import {Button, Dialog, Portal, Text} from 'react-native-paper';

class CommonDialog extends Component {
  onAccept = () => {
    if (this.props.acceptAction) {
      this.props.acceptAction();
    } else {
      this.props.actions.visible(false);
    }
  };
  onDismiss = () => this.props.actions.visible(false);

  render() {
    return (
      <Portal>
        <Dialog visible={!!this.props.visible} onDismiss={this.onDismiss}>
          {this.props.title ? <Dialog.Title>{this.props.title}</Dialog.Title> : null}
          <Dialog.Content>
            <Text variant="bodyMedium">{this.props.message || ''}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {this.props.cancelTitle ? (
              <Button onPress={this.onDismiss}>{this.props.cancelTitle}</Button>
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
