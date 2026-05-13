import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {normalizeSize} from '../../../styles/basicStyles';
import {fieldErrors} from '../../../utils/screenFunctions';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';

class CreateProductCategoryScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      'Formulario crear categoría producto',
      'CreateProductCategoryScreen',
    );
  }
  componentWillUnmount() {
    this.props.actions.clearScreen();
  }
  render() {
    const nameErr = fieldErrors('name', this.props.errors);
    return (
      <Layout
        title={'Crear'}
        subtitle={'producto'}
        contentContainerStyle={{justifyContent: 'flex-start'}}
        description={
          'Recuerda que desde piida.co puedes crear de forma masiva tus productos.'
        }
        hideLogo={true}>
        <View style={{width: '100%', paddingHorizontal: normalizeSize(20)}}>
          <TextInput
            mode="outlined"
            label="Nombre"
            placeholder="Nombre del producto"
            left={<TextInput.Icon icon="package-variant" />}
            value={this.props.name || ''}
            error={!!nameErr}
            onChangeText={(name) => this.props.actions.nameChange(name)}
            style={{marginTop: normalizeSize(6)}}
          />
          <HelperText type="error" visible={!!nameErr}>
            {nameErr}
          </HelperText>

          <Button
            mode="contained"
            onPress={() =>
              this.props.actions.createProduct({
                navigation: this.props.navigation,
              })
            }
            style={{marginTop: normalizeSize(12)}}
            contentStyle={{paddingVertical: normalizeSize(6)}}>
            Crear producto
          </Button>
        </View>
      </Layout>
    );
  }
}
export default CreateProductCategoryScreen;
