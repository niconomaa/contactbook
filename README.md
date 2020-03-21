# contactbook 🦠
You're infected!

Find out if people you have been in contact with (or their contacts) have been infected with the virus.

### Setup

This app is an React Native app **ejected** from Expo. This means that it consists out of two parts: 

- A JS Bundle with the JavaScript/React Native code base
- An ios/ and an android/ folder with the native code for the corresponding packages

This means that, in order to develop and run the app, you need to compile both the Expo-based JS bundle part **and** the platform specific code (e. g. for iOS or Android). 

1. Make sure to have the Expo CLI installed:
    ```bash
    yarn global add expo-cli
    ```
1. Install the NPM dependencies:
    ```bash
    yarn install
    ```
1. Run Expo to bundle the JS part of the app (see https://docs.expo.io/versions/latest/expokit/expokit/#2-run-the-project-with-expo-cli):
   ```bash
   expo start
   ```

**For instrucctions on how to run the native part of the app on either iOS or Android, see https://docs.expo.io/versions/latest/expokit/expokit/#3-ios-configure-build-and-run and https://docs.expo.io/versions/latest/expokit/expokit/#4-android-build-and-run.**

