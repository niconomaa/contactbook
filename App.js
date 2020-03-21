import * as React from 'react';

import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/react-hooks';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';

const Stack = createStackNavigator();
console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];

import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  // uri: 'https://48p1r2roz4.sse.codesandbox.io',
  // uri: "https://localhost:4000",
  uri: "http://<IP>:4000/",
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
        },
      },
    },
  });


export default function App(props) {
  const { t } = useTranslation();
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });
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
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer
            ref={containerRef}
            initialState={initialNavigationState}
          >
            <Stack.Navigator>
              <Stack.Screen name={t('appName')} component={BottomTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </ApolloProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
