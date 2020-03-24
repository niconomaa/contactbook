import * as React from 'react';
import { UserContext } from './UserContext';
import { useTranslation } from 'react-i18next';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

export default function AppWrapper() {
    const styles = StyleSheet.create({
        container: {
        flex: 1,
        backgroundColor: '#fff',
        },
    });
    
    const containerRef = React.useRef();
    const { t } = useTranslation();
    const user = React.useContext(UserContext);

    if(!user.loggedInUid){
        console.log('User is not logged in!');
        return (
            <View style={styles.container}>
                <LoginScreen/>
            </View>
        )
    }

    console.log('User is logged in!');

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <NavigationContainer
                ref={containerRef}
            >
                <Stack.Navigator>
                    <Stack.Screen name={t('appName')} component={BottomTabNavigator} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}
