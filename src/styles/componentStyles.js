import {StyleSheet, Dimensions} from 'react-native';
import { colors, normalizeSize, fonts } from './basicStyles';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const getProgressStyles = () =>
  StyleSheet.create({
  messageProgress: {
    textAlign: 'center',
    fontSize:normalizeSize(16),
    color: colors.loaderText,
    fontFamily:fonts.regular,
  },
  indicatorProgress: {
    color: colors.loaderIndicator,
  },
  overlay:{
    backgroundColor:'rgba(255,255,255,0.8)',
    position:'absolute',
    width:'100%',
    height:'100%',
    zIndex:1,
    alignContent:'center',
    justifyContent:'center'
  },
});

const getDialogStyles = () =>
  StyleSheet.create({
    overlay:{
      backgroundColor:'rgba(0,0,0,0.53)',
      position:'absolute',
      width:'100%',
      height:'100%',
      zIndex:1,
      alignContent:'center',
      justifyContent:'center'
    },
    confirm: {
      borderRadius: normalizeSize(8),
      backgroundColor:'white',
      marginHorizontal:normalizeSize(25),
      paddingHorizontal:normalizeSize(20),
      paddingVertical:normalizeSize(20),
    },
    titleConfirm: {
      textAlign: 'center',
      color:colors.dialogTitle,
      fontSize:normalizeSize(18),
      marginVertical:normalizeSize(12),
      fontFamily:fonts.medium,
    },
    textConfirm: {
      textAlign: 'center',
      fontSize:normalizeSize(14),
      color:colors.dialogText,
      fontFamily:fonts.regular,
      margin:normalizeSize(10),
    },   
    icon:{
      width:normalizeSize(22),
      height:normalizeSize(19),
      alignSelf:'center',
      marginBottom:normalizeSize(26)
    },
    closeContainer:{
      position:'absolute',
      top:normalizeSize(0),
      right:normalizeSize(0),
      padding:normalizeSize(9)
    },
    close:{
      width:normalizeSize(24),
      height:normalizeSize(24),
      tintColor:'black'
    },
    button:{
      //width:'100%',
      marginVertical:normalizeSize(12)
    },
   
    buttons:{
      flexDirection:'row',
      justifyContent:'space-between',
      alignSelf:'center',
      alignItems:'center',
      alignContent:'center',
      alignSelf:'center'
    },
  }
);

const getButtonStyles = () => 
  StyleSheet.create({
    container:{
      shadowColor: 'black',
      shadowOpacity: 0.3, // IOS
      shadowRadius: normalizeSize(3), //IOS
      paddingHorizontal:normalizeSize(10),
      borderRadius:normalizeSize(5),
      minHeight:normalizeSize(40),
      minWidth:normalizeSize(176), 
      backgroundColor:colors.buttonBackground,
      alignSelf:'center',
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center'
    },
    notPressed:{
      shadowOffset: { height: normalizeSize(4), width: 0}, // IOS
      elevation: normalizeSize(4), // Android
    },
    pressed:{
      shadowOffset: { height: normalizeSize(5), width: 0}, // IOS
      elevation: normalizeSize(10), // Android
    },
    text:{
      fontFamily:fonts.medium,
      color:colors.buttonText,
      fontSize: normalizeSize(16),
      textAlign:'center'
    },
    icon:{
      width:normalizeSize(18),
      height:normalizeSize(18),
      alignSelf:'center',
      marginStart:normalizeSize(6)
    }
  }
);

const getTextInputStyles = () =>
	StyleSheet.create({
    textInputContainer:{
      flexDirection:'row', 
      minHeight:normalizeSize(43),
      borderWidth:normalizeSize(1),
      justifyContent:'center',
      alignItems:'center',
      paddingHorizontal:normalizeSize(10),
    },
    icon:{
      tintColor:colors.inputTextColor,
      marginEnd:normalizeSize(8),
      height:normalizeSize(16),
      width:normalizeSize(16),
    },
    input:{
      paddingTop: normalizeSize(0),
      paddingBottom: normalizeSize(0),
      paddingStart:normalizeSize(0), 
      paddingEnd:normalizeSize(0), 
      fontSize:normalizeSize(14),
      color: colors.inputTextColor,
      fontFamily:fonts.regular,
      flex:1,
      height:'100%',
    },
    arrow:{
      width:normalizeSize(15),
      height:normalizeSize(15),
      tintColor:colors.text
    },
    maxLength:{
      paddingTop:normalizeSize(4),
      paddingStart:normalizeSize(11),
      paddingEnd:0,
      fontSize:normalizeSize(12),
      color: colors.inputTextColor,
      position:'absolute',
      top:0,
      end:0,
      fontFamily:fonts.regular,
    },
    errorText:{
      color:colors.error,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
    },
    descriptionText:{
      color:colors.inputTextColor,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
    },
    label:{
      color:colors.label,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
    }
  }
);

const getSelectListStyles = () =>
  StyleSheet.create({
    textInputContainer:{
      flexDirection:'row', 
      minHeight:normalizeSize(43),
      borderWidth:normalizeSize(1),
      justifyContent:'center',
      alignItems:'center',
      paddingHorizontal:normalizeSize(10),
      borderRadius:normalizeSize(5)
    },
    errorText:{
      color:colors.error,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
    },
    icon:{
      tintColor:colors.inputPlaceholder,
      marginEnd:normalizeSize(6),
      height:normalizeSize(17),
      width:normalizeSize(17),
    },
    input:{
      paddingTop:normalizeSize(10), 
      paddingBottom: normalizeSize(12),
      paddingStart:0,
      paddingEnd:0,
      fontSize:normalizeSize(14),
      color: colors.inputTextColor,
      fontFamily:fonts.regular,
      flex:1,
      textAlignVertical:'top'
    },
    arrowCont:{
      alignContent:'center',
      alignItems:'center',
      justifyContent:'center',
    },
    arrow:{
      width:normalizeSize(11), 
      height:normalizeSize(5), 
      marginBottom:normalizeSize(2), 
      alignSelf:'center',
      tintColor:colors.inputPlaceholder
    },
    bottomSheetContainer:{
      paddingHorizontal:normalizeSize(20),
      borderTopEndRadius:normalizeSize(10),
      borderTopStartRadius:normalizeSize(10),
    },
    sheetTitle:{
      color:colors.dialogTitle,
      fontSize:normalizeSize(14),
      fontFamily:fonts.regular,
      paddingBottom:normalizeSize(15)
    },
    sheetOption:{
      color:colors.text,
      fontSize:normalizeSize(16),
      fontFamily:fonts.medium,
      paddingVertical:normalizeSize(7),
      paddingHorizontal:normalizeSize(10)
    },
    label:{
      color:colors.label,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
    }
  }
);

const getTopSheetStyles = () => 
  StyleSheet.create({
    container:{ 
      position:'absolute', 
      top:0, 
      left:0, 
      right:0, 
      justifyContent:'flex-start', 
      height:'100%'
    },
    card:{
      backgroundColor:colors.text, 
    }
  }
);

const getHeaderStyles = () => 
  StyleSheet.create({
    container:{ 
      flexDirection:'row',
      backgroundColor:'white'
    },
    backImage:{
      width:normalizeSize(44),
      height:normalizeSize(44),
      marginStart:normalizeSize(17)
    },
    logoCont:{
      flex:1
    },
    logo:{
      width:normalizeSize(100),
      height:normalizeSize(60),
      marginTop:normalizeSize(9),
    },
    supportCont:{
      paddingHorizontal:normalizeSize(20),
      paddingBottom:normalizeSize(10),
    },
    more:{
      width:normalizeSize(51),
      height:normalizeSize(51),
    },
    link:{
      color:colors.red,
      fontSize:normalizeSize(12),
      textAlign:'center',
      fontFamily:fonts.medium,
      textDecorationLine:'underline'
    },
  }
);

const getOrderProductItemStyles = () =>
  StyleSheet.create({
    container:{
      backgroundColor:'#F7F7F7',
      flexDirection:'row',
      alignItems:'center',
      minHeight:normalizeSize(77),
      paddingHorizontal:normalizeSize(20),
      paddingVertical:normalizeSize(10),
      borderRadius:normalizeSize(5)
    },
    name:{
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.regular,
      marginEnd:normalizeSize(20),
    },
    kg:{
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
      marginStart:normalizeSize(5),
    },
    shipping:{
      color:colors.text,
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
    },
    qtyTxt:{
      color:'white',
      fontSize:normalizeSize(15),
      fontFamily:fonts.medium,
      textAlign:'center',
      alignSelf:'center'
    },
    qtyCont:{
      backgroundColor:colors.buttonBackground,
      minWidth:normalizeSize(20),
      paddingEnd:normalizeSize(5),
      paddingStart:normalizeSize(5),
      paddingTop:normalizeSize(2),
      paddingBottom:normalizeSize(2),
    },
    prosCont:{
      marginVertical:normalizeSize(10),
    },
    proCont:{
      flexDirection:'row',
      marginHorizontal:normalizeSize(10),
    },
    proName:{
      color:colors.text,
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
      marginEnd:normalizeSize(5)
    },
    proQty:{
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
    }
  }
);

const saleProductItemStyles = () =>
  StyleSheet.create({
    container:{
      backgroundColor:'#F7F7F7',
      alignItems:'center',
      paddingVertical:normalizeSize(10),
      paddingHorizontal:normalizeSize(15),
      borderRadius:normalizeSize(5),
    },
    nameCont:{
      flex:1, 
      flexDirection:'row',
    },
    proCont:{
      flex:1, 
      flexDirection:'row',
      marginHorizontal:normalizeSize(20),
    },
    name:{
      flex:1,
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.bold,
    },
    label:{
      color:colors.text,
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
      width:normalizeSize(70)
    },
    checkCont:{
      flexDirection:'row',
      alignItems:'center'
    },  
    checkLabel:{
      color:colors.text,
      fontSize:normalizeSize(12),
      width:normalizeSize(60),
      fontFamily:fonts.regular,
    },
    checkText:{
      color:colors.text,
      fontSize:normalizeSize(12),
      fontFamily:fonts.regular,
      textAlign:'center'
    },
    check:{
      width:normalizeSize(20),
      height:normalizeSize(20),
    },
    unitPriceCont:{
      flexDirection:'row',
      alignItems:'center',
      marginTop:normalizeSize(15)
    },
    unitPrice:{
      flex:1,
      padding:0,
      marginHorizontal:normalizeSize(10),
    },
    shipping:{
      marginStart:normalizeSize(10),
      fontSize:normalizeSize(14),
      fontFamily:fonts.semiBold,
      color:colors.text,
      textAlign:'right',
      flex:1
    },
    qtyInput:{
      minWidth:normalizeSize(80),
    },
    inputStyle:{
      minHeight:normalizeSize(30),
      borderRadius:0,
      borderTopStartRadius:normalizeSize(5),
      borderBottomStartRadius:normalizeSize(5),
    },
    qtyTxt:{
      color:colors.text,
      fontSize:normalizeSize(15),
      minWidth:normalizeSize(20),
      marginHorizontal:normalizeSize(5),
      fontFamily:fonts.medium,
      textAlign:'center',
      alignSelf:'center'
    },
    qtyCont:{
      alignSelf:'flex-start',
      alignItems:'center',
      marginTop:normalizeSize(5),
      flexDirection:'row',
    },
    deleteCont:{
      paddingStart:normalizeSize(10),
    },
    deleteIcon:{
      width:normalizeSize(20),
      height:normalizeSize(20)
    },
    btnIcon:{
      width:normalizeSize(30),
      height:normalizeSize(30),
    },
    btnTop:{
      borderTopEndRadius:normalizeSize(5),
      borderBottomEndRadius:normalizeSize(5),
    }
  }
);

const productStyles = () =>
  StyleSheet.create({
    listCont:{
      marginHorizontal:normalizeSize(16),
      marginTop:normalizeSize(10),
      borderRadius:normalizeSize(5),
      shadowColor: 'black',
      shadowOpacity: 0.15, // IOS
      shadowRadius: normalizeSize(3), //IOS
      backgroundColor:'white',
      padding:normalizeSize(10),
      shadowOffset: { height: normalizeSize(4), width: 0}, // IOS
      elevation: normalizeSize(10), // Android
    },
    listText:{
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
      color:colors.text
    },
    seeVariations:{
      fontSize:normalizeSize(14),
      fontFamily:fonts.medium,
      color:colors.carmine,
      alignSelf:'flex-end'
    },
    label:{
      fontSize:normalizeSize(14),
      fontFamily:fonts.regular,
      color:colors.dialogTitle
    },
  }
);

const getMovementStyles = () => 
  StyleSheet.create({
    container:{
      shadowColor: 'black',
      shadowOpacity: 0.2, // IOS
      shadowRadius: normalizeSize(3), //IOS
      paddingHorizontal:normalizeSize(20),
      paddingVertical:normalizeSize(15),
      borderRadius:normalizeSize(5),
      backgroundColor:'white',
      justifyContent:'center',
      alignItems:'center',
      flexDirection:'row'
    },
    notPressed:{
      shadowOffset: { height: normalizeSize(2), width: 0}, // IOS
      elevation: normalizeSize(4), // Android
    },
    pressed:{
      shadowOffset: { height: normalizeSize(5), width: 0}, // IOS
      elevation: normalizeSize(10), // Android
    },
    in:{
      width:normalizeSize(20),
      height:normalizeSize(20),
      tintColor:'green'
    },
    out:{
      width:normalizeSize(20),
      height:normalizeSize(20),
      tintColor:colors.error,
      transform: [{ rotate: '180deg'}]
    },
    center:{
      flex:1,
      marginHorizontal:normalizeSize(10)
    },
    product:{
      fontFamily:fonts.re,
      color:colors.text,
      fontSize: normalizeSize(15),
    },
    status:{
      fontFamily:fonts.bold,
      color:colors.text,
      fontSize: normalizeSize(14),
    },
    value:{
      fontFamily:fonts.medium,
      fontSize: normalizeSize(14),
      textAlign:'right'
    },
    qty:{
      fontFamily:fonts.regular,
      color:colors.text,
      fontSize: normalizeSize(14),
      textAlign:'right'
    },
    payTxt:{
      fontFamily:fonts.bold,
      color:colors.error,
      fontSize: normalizeSize(14.5),
      textAlign:'right'
    },
  }
)

const getCircletyles = () => {
  // CircleChart usa SVG limpio (ver components/circleChart.js). Los styles
  // legacy `circle`, `circleSmall`, `circleTwo`, `circleInner` y
  // `progressChart` quedaron sin uso después de la migración a SVG.
  return StyleSheet.create({
    container:{
      flexDirection:'row',
      alignItems:'center',
      paddingVertical:normalizeSize(10),
      minHeight:220,
    },
    graph:{
      position:'absolute',
      left:normalizeSize(10),
      top:0,
    },
    pointEnter:{
      backgroundColor:colors.dialogTitle,
      width:normalizeSize(10),
      height:normalizeSize(10),
      borderRadius:normalizeSize(20)
    },
    labelCont:{
      flexDirection:'row',
      alignItems:'center',
      alignSelf:'flex-end'
    },
    pointOut:{
      backgroundColor:colors.buttonBackground,
      width:normalizeSize(10),
      height:normalizeSize(10),
      borderRadius:normalizeSize(20)
    },
    label:{
      color:colors.text,
      fontFamily:fonts.regular,
      fontSize:normalizeSize(16),
      marginHorizontal:normalizeSize(5),
      textAlign:'right'
    },
    value:{
      color:colors.red,
      fontFamily:fonts.bold,
      fontSize:normalizeSize(16),
      alignSelf:'flex-end'
    }
  });
};

const getBarStyles = () =>
  StyleSheet.create({
    bar:{
      backgroundColor:'rgba(247, 169, 40, 0.1)',
      minHeight:normalizeSize(40),
      alignContent:'center',
      marginBottom:normalizeSize(10),
      justifyContent:'center',
      position:'relative',
    },
    barInner:{
      backgroundColor:'rgba(247, 169, 40, 0.5)',
      height:'100%',
      position:'absolute',
      borderRightWidth:normalizeSize(3),
      borderColor:colors.buttonBackground
    },
    labelCont:{
      flexDirection:'row',
      alignItems:'center'
    },
    label:{
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.bold,
      marginStart:normalizeSize(10),
      marginTop:normalizeSize(5),
      flex:1
    },
    details:{
      color:colors.label,
      fontSize:normalizeSize(14),
      fontFamily:fonts.bold,
      alignSelf:'flex-end',
      marginVertical:normalizeSize(5),
      marginHorizontal:normalizeSize(5),
    },
    value:{
      color:colors.text,
      fontSize:normalizeSize(14),
      fontFamily:fonts.bold,
      marginEnd:normalizeSize(10),
      marginTop:normalizeSize(5),
    },
    width:screenWidth - normalizeSize(80),
    height:screenWidth,
  }
);

const getSearchStyles = () =>
  StyleSheet.create({
    container:{
      marginHorizontal:normalizeSize(20), 
    },
    mailContainer:{
      flexDirection:'row', 
     
      borderBottomWidth:normalizeSize(1)
    }, 
    icon:{
      width:normalizeSize(18),
      height:normalizeSize(18),
      marginStart:normalizeSize(10),
      marginEnd:normalizeSize(10),
      alignSelf:'center',
      tintColor:colors.inputTextColor
    },
    text:{
      fontFamily:fonts.regular,
      fontSize:normalizeSize(14),
      color:colors.inputTextColor,
      padding: 0,
      paddingVertical: normalizeSize(10),
      flex:1,
    },
    resultsContainer:{
      marginTop:normalizeSize(5),
      borderRadius:normalizeSize(10), 
      paddingHorizontal:normalizeSize(16), 
      marginHorizontal:normalizeSize(24),
      paddingVertical:normalizeSize(0),
      backgroundColor:colors.text,
      opacity:0.8
    },
    itemContainer:{
      flexDirection:'row', 
      justifyContent:'center',
      alignContent:'center',
      alignItems:'center',
      paddingTop:normalizeSize(16),
      paddingBottom:normalizeSize(16),
    },
    itemText:{
      flex:1,
      padding:0,
      fontSize: normalizeSize(14),
      color: 'white',
      lineHeight:normalizeSize(16),
      fontFamily:fonts.medium,
    },
    arrow:{
      width:normalizeSize(15),
      height:normalizeSize(15),
      alignSelf:'center',
      tintColor:'white'
    },
    clear:{
      width:normalizeSize(15),
      height:normalizeSize(15),
      alignSelf:'center',
      tintColor:colors.inputTextColor,
    },
    clearCont:{
      justifyContent:'center', 
      padding:normalizeSize(10), 
      
    },
  });

  const QRScannerStyles = () =>
    StyleSheet.create({
      link:{
        color:colors.red,
        fontFamily:fonts.bold,
        fontSize:normalizeSize(16),
        marginHorizontal:normalizeSize(24),
        marginVertical:normalizeSize(10),
        textAlign:'center'
      },
      flashButton: {
        position: 'absolute',
        bottom:normalizeSize(20),
        right:0,
      },
    });

export {
  getProgressStyles,
  getDialogStyles,
  getButtonStyles,
  getTextInputStyles,
  getTopSheetStyles,
  getHeaderStyles,
  getSelectListStyles,
  getOrderProductItemStyles,
  getMovementStyles,
  getCircletyles,
  getBarStyles,
  getSearchStyles,
  saleProductItemStyles,
  QRScannerStyles,
  productStyles
}