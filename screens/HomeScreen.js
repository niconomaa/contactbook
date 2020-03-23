import * as React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Button,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
// import * as Contacts from 'expo-contacts';
import { selectContactPhone } from 'react-native-select-contact';
import * as SecureStore from 'expo-secure-store';

import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import * as SMS from 'expo-sms';

import { MonoText } from '../components/StyledText';
import { gql } from 'apollo-boost';
import { useQuery, useMutation, resetApolloContext } from '@apollo/react-hooks';
import { sha256 } from 'js-sha256';
import { parse } from 'graphql';


const GET_MYSELF = gql`
  query findMyself($uid: String!) {
    me(uid: $uid) {
      uid
      mobilePhone
      infected
    }
  }
`;

const GET_STREAK = gql`
  query getStreak($uid: String!) {
    streak(uid: $uid) 
  }
`;


const MARK_AS_INFECTED = gql`
  mutation markMeAsInfected($uid: String!) {
    markMeAsInfected(uid: $uid) {
      person{
      uid
      infected
      }
    }
  }
`;

// TODO test if this works, completely; formerly the wrong (own) uid was returned
const ADD_NEW_CONTACT_PERSON = gql`
  mutation addNewContactPerson($myUid: String!, $phNr: String!) {
    addNewContactPerson(myUid: $myUid, contactMobilePhone: $phNr) {
      person {
        uid
      }
    }
  }
`;

const ADD_MYSELF = gql`
  mutation addPerson($phNr: String!) {
    addPerson(mobilePhone: $phNr) {
      person {
        uid
        mobilePhone
      }
    }
  }
`;


// this is what we can use to send SMS messages to "invite" contacts to the app
// async function sendSMS() {
//   const isAvailable = await SMS.isAvailableAsync();
//   if (isAvailable) {
//     const { result } = await SMS.sendSMSAsync(
//       ['‭+49 177 1909084‬'],
//       'Hallo, YoNas hat gesagt, er hatte heute Kontakt mit Dir. Damit wir Dich informieren können, wenn sich jemand in Deinem Umfeld infiziert hat, melde Dich bitte bei Kontakt-Buch an.'
//     );
//   } else {
//     // misfortune... there's no SMS available on this device
//   }
// }

getLoggedInUserId = async () => {
  try {
    const uid = SecureStore.getItemAsync("logged_in_user_id");
    if(uid !== null) {
      return uid;
    }
    return null;
  } catch(e) {
    // error reading value
  }
}

setLoggedInUserId = async (userId) => {
  try {
    await SecureStore.setItemAsync("logged_in_user_id", userId);
  } catch (e) {
    // saving error
  }
}

deleteLoggedInUserId = async () => {
  try {
    await SecureStore.deleteItemAsync("logged_in_user_id");
  } catch (e) {
    // saving error
  }
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  // let t = x => x;

  const [isLookingForCachedUid, setIsLookingForCachedUid] = React.useState(true);
  const [loggedInUid, setLoggedInUid] = React.useState(null);
  [contacts, setContacts] = React.useState([]);
  [streak, setStreak] = React.useState(undefined);
  [alerts, setAlerts] = React.useState([]);
  [achievements, setAchievements] = React.useState([]);
  [warnings, setWarnings] = React.useState([]);
  const [addMyself, { data: addMyselfResponse }] = useMutation(ADD_MYSELF);
  const [markMeAsInfected, { data: markMeAsInfectedResponse }] = useMutation(MARK_AS_INFECTED);
  const [addNewContactPerson, { data: addNewContactPersonResponse }] = useMutation(ADD_NEW_CONTACT_PERSON);
  const [enteredOwnPhoneNumber, onChangeEnteredOwnPhoneNumber] = React.useState();



  // Similar to componentDidMount and componentDidUpdate:
  React.useEffect(() => {
    getLoggedInUserId().then(cachedUid => {
      console.log(`Cached UID: ${cachedUid}`);
      if (cachedUid) {
        setLoggedInUid(cachedUid);
      }
      // getStreak(loggedInUid);
      setIsLookingForCachedUid(false);
    });
  });

    // Similar to componentDidMount and componentDidUpdate:
    React.useEffect(() => {
  // TODO RETRIES!
  // setTimeout(() => {
  //   setAlerts([
  //     {
  //       type: "infectionInNthDegreeInNetwork",
  //       value: 2,
  //     },
  //   ]);
  // }, 2000);
    });

  const { loading, error, data: getStreakResponse } = useQuery(GET_STREAK, {
    variables: { uid: loggedInUid},
  });
  if (loading) return <Text>loading</Text>;
  if (error) return <Text>error</Text>;
  // setStreak(getStreakResponse);
  console.log("streak!", getStreakResponse);


  let onAdd = async () => {
    let hasContactPermissions = requestContactsPermission();
    if(hasContactPermissions){
      const newContactPhoneNumber = await getPhoneNumber();
      if (newContactPhoneNumber) {
        setContacts((existingContacts) => [...existingContacts, newContactPhoneNumber]);
        let dbReturnValue = addNewContactPerson({ variables: {myUid: loggedInUid, phNr: sha256(newContactPhoneNumber)} });
        console.log(dbReturnValue);
      }
    }
  };

  let logout = async () => {
    console.log("log out");
    deleteLoggedInUserId();
    setLoggedInUid(null);
  }

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

  async function handleOwnPhoneNumberSubmit() {
    // TODO Validate phone number
    // Format phone number
    const phoneNumberParsed = parsePhoneNumberFromString(enteredOwnPhoneNumber, 'DE');
    const phoneNumberInternational = phoneNumberParsed.formatInternational();
    // Hash phone number
    const hashedPhoneNumberInternational = sha256(phoneNumberInternational);
    // Send phone number to Backend for signup
    await addMyself({ variables: { phNr: hashedPhoneNumberInternational } });
    if (addMyselfResponse) {
      // TODO Put UID returned by Backend into state and into AsyncStorage
      const uid = addMyselfResponse["addPerson"]["person"]["uid"];
      await setLoggedInUid(uid);
      await setLoggedInUserId(uid);
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

  //GET_MYSELF
  function getMyself(uid) {
    const { loading, error, data: getMyselfResponse } = useQuery(GET_MYSELF, {
      variables: { uid },
    });
    if (loading) return <Text>loading</Text>;
    if (error) return <Text>error</Text>;
  }


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
        value: getStreakResponse.streak,
      }
    ];
  }

  // //TODO RETRIES!
  // setTimeout(() => {
  //   setAlerts([
  //     {
  //       type: "infectionInNthDegreeInNetwork",
  //       value: 2,
  //     },
  //   ]);
  // }, 5500);

  let headlineStyle;
  let headlineText = t("contacts.headline.wellDone");
  if (alerts.length > 0) {
    headlineText = t("contacts.headline.alert");
    headlineStyle = styles.colorRed;
  } else {
    if (warnings.length > 0) {
      headlineText = t("contacts.headline.stayCautious");
    }
  }

  if (isLookingForCachedUid) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.navbarTitle, {marginBottom: 20}, headlineStyle]}>{t("Loading")}</Text>
        </ScrollView>
      </View>
    );
  }

  if (!loggedInUid) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.navbarTitle, {marginBottom: 20}]}>{t("signup.heading")}</Text>
          <Text style={[styles.subheadline, styles.secondary, {marginTop: 15}]}>{t('signup.description')}</Text>
          <View
            style={{marginTop: 15, marginBottom: 10}}
          >
            <TextInput
              style={[styles.textInput]}
              onChangeText={text => onChangeEnteredOwnPhoneNumber(text)}
              value={enteredOwnPhoneNumber}
              autoFocus
              blurOnSubmit={false}
              placeholder={t("signup.phoneNumber.placeholder")}
              textContentType="telephoneNumber"
              keyboardType="phone-pad"
              autoCompleteType="tel"
            />
          </View>
          <Button
            style={{marginTop: 30}}
            title={t("signup.phoneNumber.submit")}
            disabled={enteredOwnPhoneNumber === undefined || enteredOwnPhoneNumber === ""}
            onPress={handleOwnPhoneNumberSubmit}
          ></Button>
        </ScrollView>
      </View>
    );
  }

  console.log("rendering");


  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.navbarTitle, {marginBottom: 20}, headlineStyle]}>{headlineText}</Text>
        {
          (achievements.length > 0 || warnings.length > 0 || alerts.length > 0) && 
          (
            <View style={styles.statiContainer}>
            {
              alerts.length > 0 && alerts.map(alert => {
                let text;
                let iconString;
                let circleString;
                switch (alert.type) {
                  case "infectionInNthDegreeInNetwork":
                    text = t("contacts.alerts.infectionInNthDegreeInNetwork", {degreeString: t(`util.infectionDegree.${alert.value}`)});
                    circleString = "!";
                    break;
                }
                return (
                  <View key={alert.type} style={styles.statusContainer}>
                    <View style={[styles.statusIconCircle, styles.statusIconCircleFilledRed]}>
                      {
                        iconString
                        ? <Ionicons style={styles.statusIcon} name={iconString} size={25}/>
                        : <Text style={[styles.title2, {color: "#fff"}]}>{circleString}</Text>
                      }
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.statusText, styles.callout, styles.semibold, styles.colorRed]}>{text}</Text>
                      <Button title={t("contacts.alerts.showMoreInformation")}></Button>
                    </View>
                  </View>
                );
              })
            }
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

        {/*
        <Text style={[styles.subheadline, styles.secondary, styles.centerHorizontally, {marginTop: 10}]}>{t('contacts.contactsToday.selectFromPreviousSeparator')}</Text>
        <Text style={[styles.subheadline, styles.secondary, {marginTop: 15}]}>{t('contacts.contactsToday.selectFromPrevious')}</Text>
        <Text style={[styles.subheadline, styles.secondary, {marginTop: 15, marginBottom: 5}]}>{t('contacts.contactsToday.selectFromPrevious')}</Text>
        {(contacts && contacts.length > 0) ? contacts.map(contact => (<Text style={[{marginBottom: 5}]} key={contact}>{contact}</Text>)) : <Text style={[styles.secondary, styles.italic]}>None yet</Text>}
        */}

        <View style={styles.welcomeContainer}>
          <Button
            title="logout"
            color="#000000"
            onPress={e => logout(e)}>
          </Button>
          <Button
            title="Add myself"
            onPress={e => {
              addMyself({ variables: { phNr: sha256("dsjdkkkkkkcbsdjcbswcbjasdcbj") } });
            }}
          ></Button>
          <Button
            title="Mark me as infected!"
            onPress={e => {
              markMeAsInfected({ variables: { uid: 'b5043305e6d44150a2b33452b76e8d12' } });
            }}
          ></Button>
          <Button
            title="Add a new contact person!"
            onPress={e => {
              addNewContactPerson({ variables: {myUid:  '38f9c9c9fa2642c29107ceebacb9540e' , phNr: sha256("2345676543234")} });
            }}
          ></Button>
          <Button
            title="Kontaktperson hinzufügen"
            color="#f194ff"
            onPress={onAdd}>

          </Button>
        </View>
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
