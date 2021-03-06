import * as React from 'react';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AppWrapper from './AppWrapper';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { ApolloProvider } from '@apollo/react-hooks';
import { UserContext } from './UserContext';

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];

import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  // uri: 'https://48p1r2roz4.sse.codesandbox.io',
  // uri: "https://localhost:4000",
  uri: "http://192.168.178.43:8000/graphql/",
});

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: cb => cb('en'),
  init: () => {},
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          appName: 'Contact Book',
          hello: 'Hello world',
          change: 'Change language',
          navigationTabs: {
            contacts: 'Contacts',
          },
          loading: "Loading …",
          signup: {
            heading: "Sign up",
            description: "Please enter your phone number (it will be encrypted and stored securely).",
            phoneNumber: {
              placeholder: "Your telephone number",
              submit: "Submit",
            },
          },
          contacts: {
            headline: {
              alert: "Alert!",
              wellDone: "Very good!",
              stayCautious: "Stay cautious!",
            },
            alerts: {
              showMoreInformation: "Learn more",
              infectionInNthDegreeInNetwork: "One of your contact persons in {{degreeString}} degree has been positively tested for COVID-19 in the last 14 days.",
            },
            warnings: {
              contactsToday: "You already had contact with {{count}} persons today – please try to limit your contacts to the abolute minimum.",
            },
            achievements: {
              noneToday: "You haven’t entered any contact persons for today yet.",
              noIncreaseStreak: "Your amount of contact persons hasn’t increased for {{count}} days!"
            },
            contactsToday: {
              headline: "With whom have you been in contact today?",
              selectFromPreviousSeparator: "— or —",
              selectFromPrevious: "Choose from your last contact persons:",
            },
            addNewContactPerson: "Add new contact person"
          },
          util: {
            infectionDegree: {
              1: "1st",
              2: "2nd",
              3: "3rd",
            },
          },
        },
      },
      de: {
        translation: {
          appName: 'Kontakt-Buch',
          hello: 'Hallo Welt',
          change: 'Sprache ändern',
          navigationTabs: {
            contacts: 'Kontakte',
          },
          signup: {
            heading: "Anmeldung",
            description: "Bitte gibt deine Handynummer an (sie wird verschlüsselt und sicher gespeichert).",
            phoneNumber: {
              placeholder: "Deine Telefonnummer",
              submit: "Abschicken",
            },
          },
          loading: "Wird geladen …",
          contacts: {
            headline: {
              alert: "Achtung!",
              wellDone: "Sehr gut!",
              stayCautious: "Bleib vorsichtig!",
            },
            alerts: {
              showMoreInformation: "Weitere Informationen anzeigen",
              infectionInNthDegreeInNetwork: "Eine deiner Kontaktpersonen {{degreeString}} Grades der letzten 14 Tage wurde positiv auf COVID-19 getestet.",
            },
            warnings: {
              contactsToday: "Du hattest heute bereits mit {{count}} Personen Kontakt – bitte versuche, möglichst wenige Kontaktpersonen zu haben.",
            },
            achievements: {
              noneToday: "Du hast bisher keine Kontaktpersonen für heute eingetragen.",
              noIncreaseStreak: "Die Zahl deiner Kontaktpersonen hat sich seit {{count}} Tagen nicht erhöht!"
            },
            contactsToday: {
              headline: "Mit wem warst du heute in Kontakt?",
              selectFromPreviousSeparator: "— oder —",
              selectFromPrevious: "Wähle aus deinen letzten Kontaktpersonen:",
            },
            addNewContactPerson: "Neue Kontaktperson hinzufügen",
          },
          util: {
            infectionDegree: {
              1: "ersten",
              2: "zweiten",
              3: "dritten",
            },
          },
        },
      },
    },
  });

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loggedInUid, setLoggedInUid] = React.useState(null);

  getStoredUid = async () => {
    try {
      const uid = await SecureStore.getItemAsync("logged_in_user_id");
      if(uid !== null) {
        console.log(uid);
        setLoggedInUid(uid);
        return uid;
      }
      return null;
    } catch(e) {
      // error reading value
    }
  }

  setStoredUid = async (uid) => {
      try {
        await SecureStore.setItemAsync("logged_in_user_id", uid);
        setLoggedInUid(uid);
      } catch (e) {
        // saving error
      }
    }

  deleteStoredUid = async () => {
      console.log('2sdafasdfasd');
      try {
        await SecureStore.deleteItemAsync("logged_in_user_id");
        setLoggedInUid(null);
      } catch (e) {
        // deleting error
      }
  }

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'SFProDisplay-SemiboldItalic': require('./assets/fonts/SFProDisplay-SemiboldItalic.otf'),
          'SFProDisplay-Regular': require('./assets/fonts/SFProDisplay-Regular.otf'),
          'SFProDisplay-Bold': require('./assets/fonts/SFProDisplay-Bold.otf'),
          'SFProText-Regular': require('./assets/fonts/SFProText-Regular.otf'),
          'SFProText-Semibold': require('./assets/fonts/SFProText-Semibold.otf'),
        });

        console.log(getStoredUid());
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <ApolloProvider client={client}>
        <UserContext.Provider value={{
          loggedInUid,
          getStoredUid,
          setStoredUid,
          deleteStoredUid
          }}>
          <AppWrapper/>
        </UserContext.Provider>
      </ApolloProvider>
    );
  }
}
