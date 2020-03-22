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
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
// import * as Contacts from 'expo-contacts';
import { selectContactPhone } from 'react-native-select-contact';
import * as SMS from 'expo-sms';

import { MonoText } from '../components/StyledText';
import { gql } from 'apollo-boost';
import { useQuery, useMutation, resetApolloContext } from '@apollo/react-hooks';
import { sha256 } from 'js-sha256';


const GET_MYSELF = gql`
  query findMyself($uid: String!) {
    me(uid: $uid) {
      uid
      mobilePhone
      infected
    }
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

export default function HomeScreen() {


  [contacts, setContacts] = React.useState([]);

  let onAdd = () => {
    hasContactPermissions = requestContactsPermission();
    console.log(hasContactPermissions);
    if(hasContactPermissions){
      getPhoneNumber();
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

  function getPhoneNumber() {
    return selectContactPhone()
        .then(selection => {
            if (!selection) {
                return null;
            }

            let { contact, selectedPhone } = selection;
            console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);
            return selectedPhone.number;
        });
  }


  //GET_MYSELF
  function getMyself(uid) {
    console.log("ssssss")
    const { loading, error, getMyselfResponse } = useQuery(GET_MYSELF, {
      variables: { uid },
    });
    if (loading) return <Text>loading</Text>;
    if (error) return <Text>error</Text>;
    console.log(getMyselfResponse);
  }

  getMyself('38f9c9c9fa2642c29107ceebacb9540e');


  const [addMyself, { data: addMyselfResponse }] = useMutation(ADD_MYSELF);
  const [markMeAsInfected, { data: markMeAsInfectedResponse }] = useMutation(MARK_AS_INFECTED);
  const [addNewContactPerson, { data: addNewContactPersonResponse }] = useMutation(ADD_NEW_CONTACT_PERSON);

  return (
    <View style={styles.container}>
      {/* <Text>{data}</Text> */}
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.welcomeContainer}>
          <Button
            title="Add myself"
            onPress={e => {
              addMyself({ variables: { phNr: sha256("dsjcbsdjcbswcbjasdcbj") } });
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

        <View style={styles.getStartedContainer}>
          <DevelopmentModeNotice />

          <Text style={styles.getStartedText}>
            Open up the code for this screen:
          </Text>

          <View
            style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          >
            <MonoText>screens/HomeScreen.js</MonoText>
          </View>

          <Text style={styles.getStartedText}>
            Change any of the text, save the file, and your app will
            automatically reload.
          </Text>
        </View>

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={handleHelpPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              Help, it didn’t automatically reload!
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.tabBarInfoContainer}>
        <Text style={styles.tabBarInfoText}>
          This is a tab bar. You can edit it in:
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.navigationFilename]}
        >
          <MonoText style={styles.codeHighlightText}>
            navigation/BottomTabNavigator.js
          </MonoText>
        </View>
      </View>
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
    backgroundColor: '#fff',
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
