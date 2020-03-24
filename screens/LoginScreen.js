import * as React from 'react';
import {
    Text,
    View,
    Button,
    TextInput,
    StyleSheet,
    ScrollView
  } from 'react-native';
import { useTranslation } from 'react-i18next';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { UserContext } from '../UserContext';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { sha256 } from 'js-sha256';

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

export default function LoginScreen() {
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          paddingHorizontal: 15,
          backgroundColor: '#fff',
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
        subheadline: {
          fontFamily: 'SFProText-Regular',
          fontWeight: '400',
          fontSize: 15,
          lineHeight: 20,
          letterSpacing: -0.24,
          color: '#000000',
          textAlign: 'left',
        },
        secondary: {
          color: '#3C3C43',
          opacity: 0.6,
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
        contentContainer: {
          paddingTop: 30,
        },

    });

    const { t } = useTranslation();
    const [enteredOwnPhoneNumber, onChangeEnteredOwnPhoneNumber] = React.useState();
    const [addMyself, { loading: addMyselfLoading, error: addMyselfError, data: addMyselfData }] = useMutation(ADD_MYSELF);
    const user = React.useContext(UserContext);

    React.useEffect(()=> {
        console.log(addMyselfLoading);
        console.log(addMyselfError);
        console.log(addMyselfData);
        if (addMyselfData) {
              const uid = addMyselfData["addPerson"]["person"]["uid"];
              user.setStoredUid(uid);
        }
    });


    async function handleOwnPhoneNumberSubmit() {
        // TODO Validate phone number
        // Format phone number
        const phoneNumberParsed = parsePhoneNumberFromString(enteredOwnPhoneNumber, 'DE');
        const phoneNumberInternational = phoneNumberParsed.formatInternational();
        // Hash phone number
        const hashedPhoneNumberInternational = sha256(phoneNumberInternational);
        // Send phone number to Backend for signup
        addMyself({ variables: { phNr: hashedPhoneNumberInternational } });
    }

    if(addMyselfLoading) {
        return <Text style={[styles.navbarTitle, {marginBottom: 20}]}>warte mal</Text>
    }

    if(addMyselfError) {
        return <Text style={[styles.navbarTitle, {marginBottom: 20}]}>error</Text>
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.navbarTitle, {marginBottom: 20}]}>{t("signup.heading")}</Text>
          <Text style={[styles.subheadline, styles.secondary, {marginTop: 15}]}>{t('signup.description')}</Text>
          <Text style={[styles.subheadline, styles.secondary, {marginTop: 15}]}>{enteredOwnPhoneNumber}</Text>
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
    )
}