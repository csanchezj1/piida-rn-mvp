import React from "react";
import {StatusBar, KeyboardAvoidingView, Platform, ScrollView, Text, Image, Keyboard, TouchableOpacity, View} from "react-native";
import {getLayoutStyles} from '../styles/layoutStyles';
import { Autocomplete } from "../components";
import { SafeAreaView } from "react-native-safe-area-context";

const Layout = ({
  style,
  contentContainerStyle,
  children,
  title,
  subtitle,
  hideLogo,
  description,
  autoCompleteProps,
  onPress,
  qrScan,
  headerComp,
  ...props
}) => {
  const styles = getLayoutStyles();
  return(
    <>
    <StatusBar 
      barStyle="dark-content" 
      backgroundColor={'white'}/>
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}>
      <Image
        resizeMode='cover'
        style={styles.topImg}
        source={require('../assets/images/top.png')}
      />
      <Image
        style={styles.bottom}
        source={require('../assets/images/bottom.png')}
      />
      {(onPress || hideLogo) && (
        <SafeAreaView
          edges={['top']}
          style={styles.safe}>
          {hideLogo && (
            <View
              style={styles.titleCont}>
              {title && (
                <Text
                  style={styles.titleTwo}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={styles.subtitle}>
                  {subtitle}
                </Text>
              )}
              {description && (
                <Text
                  style={styles.descriptionTwo}>
                  {description}
                </Text>
              )}
            </View>
          )}
          {onPress && (
            <TouchableOpacity
              style={styles.shareCont}
              activeOpacity={0.9}
              onPress={onPress}>
              <Image
                style={styles.share}
                source={require('../assets/images/ic_share.png')}
              />
            </TouchableOpacity>
          )}
          {qrScan && (
            <TouchableOpacity
              style={styles.qrScanCont}
              activeOpacity={0.9}
              onPress={qrScan}>
              <Image
                style={styles.qrScan}
                source={require('../assets/images/qr_code_scanner.png')}
              />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      )}
      {headerComp}
      {autoCompleteProps && (
        <Autocomplete
          style={styles.search}
          placeholder={autoCompleteProps.placeholder}
          value={autoCompleteProps.value}
          onChangeText={(text) => {autoCompleteProps.onChangeText(text)}}
          results={autoCompleteProps.results}
          selectItem={() =>{
            autoCompleteProps.selectItem()
          }}
          clearText={() =>{
            autoCompleteProps.clearText(),
            Keyboard.dismiss()
          }}
        />
      )}
      
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        {...props}>
        {!hideLogo && (
          <Image
            resizeMode='contain'
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
        )}
        {!hideLogo && (
          <>
          {title && (
            <Text
              style={styles.title}>
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={styles.description}>
              {description}
            </Text>
          )}
          </>
        )}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
    </> 
  );
};

export default Layout;
