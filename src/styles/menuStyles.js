import {StyleSheet, Dimensions} from 'react-native';
import { colors, normalizeSize, fonts } from './basicStyles';
const screenWidth = Dimensions.get('window').width;

const getBottomStyles = () =>
	StyleSheet.create({
    safe:{
      backgroundColor:'white'
    },
    cont:{
      backgroundColor:'#FFF', 
      paddingBottom:normalizeSize(25)  
    },
    container:{ 
      backgroundColor:'#FFF',
      shadowColor: 'black',
      shadowOpacity: 0.1, // IOS
      shadowRadius: normalizeSize(4), //IOS
      shadowOffset: { height: normalizeSize(2), width: normalizeSize(1)}, // IOS
      elevation:normalizeSize(5),
      flexDirection: 'row',
      paddingVertical:normalizeSize(10),
      borderRadius:normalizeSize(5),
      justifyContent:'space-around',
      marginStart:normalizeSize(10),
      width:screenWidth-normalizeSize(20)-normalizeSize(55),
    },
    color:colors.label,
    textOne:{
      fontSize:normalizeSize(18),
      fontFamily:fonts.medium,
      color:'white'
    },
    distanceToEdge:{
      vertical:normalizeSize(30), 
      horizontal:normalizeSize(10)
    },
    itemContainer:{
      flex: 1,
      alignItems:'center',
    },
    itemIcon:{
      width:normalizeSize(18),
      height:normalizeSize(18),
      tintColor:'black',
      marginBottom:normalizeSize(4)
    },
    helpIcon:{
      width:normalizeSize(29),
      height:normalizeSize(29),
    },
    textIcon:{
      color:'black',
      fontFamily:fonts.medium,
      fontSize:normalizeSize(10)
    }
  }
);

const getDrawerStyles = () =>
	StyleSheet.create({
    container:{
      flexDirection:'row',
    },
    nameCont:{
      flex:1,
      marginHorizontal:normalizeSize(30),
      marginTop:normalizeSize(15),
    },
    name:{
      color:'white',
      fontFamily:fonts.medium,
      fontSize:normalizeSize(26),
      lineHeight:normalizeSize(26),
    },
    closeCont:{
      marginHorizontal:normalizeSize(20),
    },
    closeImg:{
      width:normalizeSize(51),
      height:normalizeSize(51)
    },
    storeContainer:{
      marginTop:normalizeSize(5),
      marginBottom:normalizeSize(20),
      marginHorizontal:normalizeSize(30),
      alignItems:'center',
      flexDirection:'row'
    },
    storeImg:{
      tintColor:'white',
      width:normalizeSize(15),
      height:normalizeSize(15),
      marginEnd:normalizeSize(5)
    }, 
    arrow:{
      tintColor:'white',
      width:normalizeSize(19),
      height:normalizeSize(19),
    }, 
    wp:{
      width:normalizeSize(25),
      height:normalizeSize(25),
      marginEnd:normalizeSize(10)
    }, 
    store:{
      color:'white',
      fontFamily:fonts.medium,
      fontSize:normalizeSize(14),
    },
    termsCont:{
      paddingVertical:normalizeSize(20),
      marginHorizontal:normalizeSize(30),
      borderBottomWidth:normalizeSize(1),
      borderColor:'white',
      alignItems:'center',
      flexDirection:'row'
    },
    policyCont:{
      paddingHorizontal:normalizeSize(30),
      paddingVertical:normalizeSize(10),
      marginBottom:normalizeSize(5),
      borderColor:'white',
      flexDirection:'row'
    },
    links:{
      color:'white',
      fontFamily:fonts.regular,
      fontSize:normalizeSize(16),
      flex:1
    },
    logout:{
      color:'white',
      fontFamily:fonts.regular,
      fontSize:normalizeSize(14),
      marginTop:normalizeSize(10),
      textAlign:'center',
      flex:1
    },
  }
);

const getMenuStyles = () =>
	StyleSheet.create({
    backImg:{
      width:normalizeSize(24),
      height:normalizeSize(24),
    },
  }
);

export {
  getBottomStyles,
  getDrawerStyles,
  getMenuStyles
}