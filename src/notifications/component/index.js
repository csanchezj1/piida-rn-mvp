import {Component} from 'react';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
//import PushNotification from 'react-native-push-notification';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';

export default class Notifications extends Component {
  async componentDidMount() {
    this.checkPermissions();
    /*PushNotification.createChannel(
      {
        channelId: "riogrande", 
        channelName: "RioGrande", 
      },
    );*/
  }
  componentDidUpdate() {
    if (this.props.user) {
      this.props.actions.registerToken(this.props.user.uid);
    }
  }
  async checkPermissions() {
    messaging().hasPermission()
    .then(enabled => {
      if (enabled == 1) {
        this.createNotificationListeners();
      } else {
        this.requestPermissions();
      } 
    });
    if(Platform.OS == 'android'){
      request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
      .then(request => {
        if(request === RESULTS.GRANTED){
          this.createNotificationListeners();
        }
      })
      .catch(e => console.log(e))
    }
  }
  async requestPermissions() {
    messaging().requestPermission()
      .then(() => {
        this.createNotificationListeners();
      })
  }
  async onDisplayNotification(message) {
    /*PushNotification.configure({   
      onNotification:  (notification) => {
        this.props.actions.getNotification(notification);
        // (required) Called when a remote is received or opened, or local notification is opened
        //notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    });
    let notData = {
      message: message.data.message,
      title: message.data.title,
      data:message.data,
      userInfo:message.data,
      channelId:'riogrande',
      smallIcon: 'ic_launcher',
      color: '#24919D',
    }
    
    PushNotification.localNotification(notData);*/
  }

  async createNotificationListeners() {
    messaging().onTokenRefresh(() => {
      if(this.props.user){
        this.props.actions.registerToken(this.props.user.uid);
      }
    });

    //cuando la app esta en primer plano
    messaging().onMessage((message) => {
      this.onDisplayNotification(message);
    });

    //cuando la app esta en segundo plano
    messaging().onNotificationOpenedApp((message) => {
      this.props.actions.getNotification(message);
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      //this.onDisplayNotification(remoteMessage);
    });

    //cuando la app esta muerta
    const initialRemoteNotification = await messaging().getInitialNotification()
    if (initialRemoteNotification) {
      this.props.actions.setInitialRoute(initialRemoteNotification); 
    }
  }
  render() {
    return null;
  }
}
