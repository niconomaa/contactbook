import * as React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Button
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
// import * as Contacts from 'expo-contacts';
import { selectContactPhone } from 'react-native-select-contact';

import { useTranslation } from 'react-i18next';

import * as SMS from 'expo-sms';

import { MonoText } from '../components/StyledText';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const GET_MYSELF = gql`
  {
    me {
      id
      phoneNumber
      infected
      contactedPersons {
        id
      }
    }
  }
`;

const MARK_AS_INFECTED = gql`
  mutation markMeAsInfected {
    markMeAsInfected {
      id
      infected
    }
  }
`;

const ADD_NEW_CONTACT_PERSON = gql`
  mutation addNewContactPerson($phNr: String!) {
    addNewContactPerson(phoneNumber: $phNr) {
      id
    }
  }
`;

const ADD_MYSELF = gql`
  mutation addNewPerson($phNr: String!) {
    addPerson(phoneNumber: $phNr) {
      id
    }
  }
`;

// this is what we can use to send SMS messages to "invite" contacts to the app
async function sendSMS() {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync(
      ['‭+49 177 1909084‬'],
      'Hallo, YoNas hat gesagt, er hatte heute Kontakt mit Dir. Damit wir Dich informieren können, wenn sich jemand in Deinem Umfeld infiziert hat, melde Dich bitte bei Kontakt-Buch an.'
    );
  } else {
    // misfortune... there's no SMS available on this device
  }
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();

  [contacts, setContacts] = React.useState([]);
  console.log(contacts);

  let onAdd = async () => {
    let hasContactPermissions = requestContactsPermission();
    console.log(hasContactPermissions);
    if(hasContactPermissions){
      const newContactPhoneNumber = await getPhoneNumber();
      if (newContactPhoneNumber) {
        setContacts((existingContacts) => [...existingContacts, newContactPhoneNumber]);
      }
    }
  };

  async function requestContactsPermission() {
    if (Platform.OS === 'android'){
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contactbook Contacts Permission',
            message:
              'Contactbook needs access to your contacts ' +
              'so you can add them to your contactlist.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      return true;
    }
  }

  async function getPhoneNumber() {
    return new Promise(async (resolve, reject) => {
      const selection = await selectContactPhone();
      if (!selection) {
        return resolve(null);
      }
      let { contact, selectedPhone } = selection;
      console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);
      return resolve(selectedPhone.number);
    });
  }

  // sendSMS();
  const { loadingMyself, error, data } = useQuery(GET_MYSELF);

  let achievements = [];
  let warnings = [];
  let alerts = [];

  if (contacts && contacts.length > 0) {
    warnings = [
      {
        type: "contactsToday",
        value: contacts.length,
      }
    ];
  } else {
    achievements = [
      {
        type: "noneToday",
      },
      {
        type: "noIncreaseStreak",
        value: 3,
      }
    ];
  }

  if (loadingMyself) return <Text>loading</Text>;
  console.log(data);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.navbarTitle, {marginBottom: 20}]}>
          {
            (contacts && contacts.length > 0)
            ? t("contacts.headline.stayCautious")
            : t("contacts.headline.wellDone")
          }
        </Text>
        {
          (achievements.length > 0 || warnings.length > 0 || alerts.length > 0) && 
          (
            <View style={styles.statiContainer}>
            {
              achievements.length > 0 && achievements.map(achievement => {
                let text;
                let iconString;
                let circleString;
                switch (achievement.type) {
                  case "noneToday":
                    text = t("contacts.achievements.noneToday");
                    iconString = (Platform.OS === 'android') ? "md-heart" : "ios-heart";
                    break;
                  case "noIncreaseStreak":
                    text = t("contacts.achievements.noIncreaseStreak", {count: achievement.value});
                    circleString = `${achievement.value}`;
                    break;
                }
                return (
                  <View key={achievement.type} style={styles.statusContainer}>
                    <View style={styles.statusIconCircle}>
                      {
                        iconString
                        ? <Ionicons style={styles.statusIcon} name={iconString} size={25}/>
                        : <Text style={[styles.title2]}>{circleString}</Text>
                      }
                    </View>
                    <Text style={[styles.statusText, styles.callout, styles.semibold]}>{text}</Text>
                  </View>
                );
              })
            }
            {
              warnings.length > 0 && warnings.map(warning => {
                let text;
                let iconString;
                let circleString;
                switch (warning.type) {
                  case "contactsToday":
                    text = t("contacts.warnings.contactsToday", {count: warning.value});
                    circleString = "!";
                    break;
                }
                return (
                  <View key={warning.type} style={styles.statusContainer}>
                    <View style={[styles.statusIconCircle, styles.statusIconCircleFilled]}>
                      {
                        iconString
                        ? <Ionicons style={styles.statusIcon} name={iconString} size={25}/>
                        : <Text style={[styles.title2, {color: "#fff"}]}>{circleString}</Text>
                      }
                    </View>
                    <Text style={[styles.statusText, styles.callout, styles.semibold]}>{text}</Text>
                  </View>
                );
              })
            }
          </View>
        )
        }
        <Text style={[styles.title1, {marginBottom: 15}]}>{t('contacts.contactsToday.headline')}</Text>
        <Button
          title={t("contacts.addNewContactPerson")}
          onPress={onAdd}>
        ></Button>
        <Text style={[styles.subheadline, styles.secondary, styles.centerHorizontally, {marginTop: 10}]}>{t('contacts.contactsToday.selectFromPreviousSeparator')}</Text>
        <Text style={[styles.subheadline, styles.secondary, {marginTop: 15, marginBottom: 5}]}>{t('contacts.contactsToday.selectFromPrevious')}</Text>
        {(contacts && contacts.length > 0) ? contacts.map(contact => (<Text style={[{marginBottom: 5}]} key={contact}>{contact}</Text>)) : <Text style={[styles.secondary, styles.italic]}>None yet</Text>}
      </ScrollView>
      </View>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/development-mode/'
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/get-started/create-a-new-app/#making-your-first-change'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  statiContainer: {
    marginBottom: 15,
  },
  statusContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
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
    color: "#fff",
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
