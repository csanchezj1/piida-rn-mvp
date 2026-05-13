import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {colors, normalizeSize} from '../../../styles/basicStyles';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';

class TermsScreen extends Component {
  componentDidMount() {
    registerEventScreenMounted(
      this.props,
      this.props.route.params.type == 'terms'
        ? 'Términos y condiciones'
        : 'Políticas de privacidad',
      'TermsScreen',
    );

    if (this.props.route.params.type == 'terms') {
      this.props.actions.getTerms(this.props.user.company);
    } else {
      this.props.actions.getPolicy(this.props.user.company);
    }
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }
  render() {
    return (
      <Layout
        title={this.props.route.params.type == 'terms' ? 'Términos y' : 'Políticas de'}
        subtitle={this.props.route.params.type == 'terms' ? 'condiciones' : 'privacidad'}
        hideLogo={true}>
        {this.props.text ? (
          <ScrollView
            style={{width: '100%'}}
            contentContainerStyle={{
              paddingHorizontal: normalizeSize(16),
              paddingBottom: normalizeSize(40),
            }}>
            <Card mode="outlined" style={{marginTop: normalizeSize(8)}}>
              <Card.Content>
                <Text variant="bodyMedium" style={{color: colors.text}}>
                  {this.props.text}
                </Text>
              </Card.Content>
            </Card>
          </ScrollView>
        ) : (
          <View
            style={{
              width: '100%',
              paddingHorizontal: normalizeSize(20),
              paddingTop: normalizeSize(8),
            }}>
            {Array.from(Array(20).keys()).map((e, i) => {
              return (
                <Shimmer
                  key={i}
                  style={{marginBottom: normalizeSize(8)}}
                  height={normalizeSize(14)}
                  width={'100%'}
                />
              );
            })}
          </View>
        )}
      </Layout>
    );
  }
}
export default TermsScreen;
