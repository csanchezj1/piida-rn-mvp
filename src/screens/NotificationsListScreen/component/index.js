import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {registerEventScreenMounted} from '../../../utils/analytics';
import {Layout} from '../../../layouts';
import {Shimmer} from '../../../components';
import {colors, normalizeSize} from '../../../styles/basicStyles';

class NotificationsListScreen extends Component {
  componentDidMount() {
    this.props.actions.getNotifications(this.props.user.uid);
    registerEventScreenMounted(this.props, 'Pantalla listado de notificaciones', 'NotificationsListScreen');
  }
  componentWillUnmount() {
    this.props.actions.clear();
  }
  render() {
    const list = this.props.list;
    return (
      <Layout
        contentContainerStyle={{justifyContent: 'flex-start'}}
        hideLogo
        title="Notificaciones">
        <ScrollView
          style={{width: '100%'}}
          contentContainerStyle={{paddingHorizontal: normalizeSize(16), paddingBottom: normalizeSize(40)}}>
          {!list ? (
            <View>
              {Array.from(Array(8).keys()).map((_, i) => (
                <Shimmer
                  key={i}
                  height={normalizeSize(70)}
                  style={{marginBottom: normalizeSize(8), borderRadius: 8}}
                />
              ))}
            </View>
          ) : list.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{textAlign: 'center', color: colors.purplishGrey, marginTop: normalizeSize(40)}}>
              Aún no tienes notificaciones
            </Text>
          ) : (
            list.map((item) => (
              <Card key={item.nid} mode="outlined" style={{marginBottom: normalizeSize(8)}}>
                <Card.Content>
                  <Text variant="titleSmall" style={{color: colors.label}}>
                    {item.title}
                  </Text>
                  <Text variant="bodyMedium" style={{marginVertical: normalizeSize(6)}}>
                    {item.text}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{color: colors.purplishGrey, textAlign: 'right'}}>
                    {item.date}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </Layout>
    );
  }
}
export default NotificationsListScreen;
