import * as React from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { RectButton, ScrollView } from 'react-native-gesture-handler';

export default function DiagnosisScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.navbarTitle, {marginBottom: 20}]}>Your diagnosis</Text>
        <Text style={[styles.subheadline, styles.centerHorizontally, {marginBottom: 15, marginTop: 10, textAlign: "left", color: "#FF0000", opacity: 0.6}]}>
          Please use the following button only if you have a positive test result for COVID-19.
        </Text>
        <Button
          title="I'm infected"
        ></Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  colorRed: {
    color: "#FF0000",
  },
  statiContainer: {
    marginBottom: 15,
  },
  statusContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 15,
  },
  statusIconCircle: {
    textAlign: "center",
    margin: 5,
    width: 40,
    height: 40,
    borderRadius: 40/2,
    borderColor: "#000",
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconCircleFilled: {
    backgroundColor: "#000",
  },
  statusIconCircleFilledRed: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
  statusIcon: {
    paddingTop: 4,
  },
  statusText: {
    padding: 5,
    paddingLeft: 10,
    flexShrink: 1,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  navbarTitle: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
    fontSize: 34,
    color: '#000000',
    lineHeight: 41,
    letterSpacing: 0.37,
    textAlign: 'left',
  },
  title1: {
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
    fontSize: 28,
    color: '#000000',
    lineHeight: 34,
    letterSpacing: 0.36,
    textAlign: 'left',
  },
  title2: {
    fontFamily: 'SFProDisplay-Regular',
    fontWeight: '400',
    fontSize: 22,
    color: '#000000',
    lineHeight: 28,
    letterSpacing: 0.35,
    textAlign: 'left',
  },
  subheadline: {
    fontFamily: 'SFProText-Regular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: '#000000',
    textAlign: 'left',
  },
  textInput: {
    fontFamily: 'SFProText-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: '#000000',
    textAlign: 'left',
  },
  callout: {
    fontFamily: 'SFProText-Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: '#000000',
    textAlign: 'left',
  },
  secondary: {
    color: '#3C3C43',
    opacity: 0.6,
  },
  italic: {
    fontStyle: "italic",
  },
  semibold: {
    fontFamily: 'SFProText-Semibold',
    fontWeight: '600',
  },
  centerHorizontally: {
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
