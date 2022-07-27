import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import UserInput from "../../common/components/UserInput";
import { createToast } from "../../common/components/Toast";
import { Auth, DataStore } from "aws-amplify";
import { sendProviderEmail } from "../../common/functions";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetState } from "../../redux/authReducer";
import { sendNotificationToManager } from "../../notifications";
import { Manager } from "../../src/models";

//Email verification screen after successful registration or if not verified yet
const ConfirmEmail = ({ navigation, route }) => {
  const {type} = route.params
  const dispatch = useDispatch()
  //Set the user input variables
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const email = watch('email')

  //Submit the user input
  const submitForm = async (data) => {
    try {
      await Auth.confirmSignUp(data.email.trim(), data.confirmationCode)
      if(type == 'Provider'){
        await sendProviderEmail(email)
        createToast("Your email has been verified");
        let allManagers = await DataStore.query(Manager)
        if(allManagers.length != 0){
          let messageInfo = {
            title: 'New Applicant',
            message: `A new applicant has just signed up as a provider. They should be sending their background check soon.`
          }
          for(let next of allManagers){
            if(next.expoToken){
              await sendNotificationToManager(next.expoToken, messageInfo)
            }
          }
        }
        navigation.navigate('LoginScreen', {name: 'LoginScreen'})
      }
      else{
        createToast("Your email has been verified");
        navigation.navigate('LoginScreen', {name: 'LoginScreen'})
      }
    } catch (error) {
      if(error.message === 'User cannot be confirmed. Current status is CONFIRMED'){
        navigation.navigate('LoginScreen', {name: 'LoginScreen'})
      }
      setError("confirmationCode", {
        type: "validate",
        message: "Incorrect confirmation code",
      });
    }
  };

  //Resend the confirmation code
  const resendCode = async () => {
    if(email != '' && email != undefined){
      try {
        await Auth.resendSignUp(email)
        createToast("A new confirmation code was sent to your email");
      } catch (error) {
        console.log(error);
        createToast("Email not found");
      }
    }
    else{
      setError('email', {
        type: 'validate',
        message: 'You must input your email to receive a new confirmation code'
      })
    }
  };

  useEffect(() => {
    dispatch(resetState())
  },[])

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1000}]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Email Confirmation</Text>
          <View style={[commonStyles.outerContainer, {marginVertical: 50}]}>
            <Text style={styles.header2}>
              We have sent a verification email to your email address.
              Please verify that you've received the confirmation code below.
            </Text>

            <UserInput
              style={commonStyles.inputBox}
              name="email"
              icon='email'
              location='MaterialIcons'
              rules={{
                required: "email is Required",
              }}
              placeholder={"Email"}
              control={control}
            />

            <UserInput
              style={[commonStyles.inputBox, {width: 360}]}
              name="confirmationCode"
              rules={{
                required: "Confirmation code is Required",
              }}
              placeholder={"Confirmation Code"}
              control={control}
            />

            {/* Buttons */}
            <View>
              {/* Confirm button */}
              <View style={{alignItems: 'center'}}>
                <TouchableOpacity onPress={handleSubmit(submitForm)}>
                  <View style={[styles.resendBtn, {width: 150, height: 50, marginTop: 10}]}>
                    <Text style={commonStyles.btnText}>Confirm</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Resend Button */}
              <View style={{alignItems: 'center', marginVertical: 30 }}>
                <Text style={styles.header2}>Didnt receive a code?</Text>
                <TouchableOpacity onPress={resendCode}>
                  <View style={styles.resendBtn}>
                    <Text style={commonStyles.btnText}>Re-send Confirmation</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Return button */}
              <View style={{ marginVertical: -10, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('LoginScreen', {name: 'LoginScreen'})
                  }}
                >
                  <View style={[styles.resendBtn, { width: 250, height: 50, marginTop: 10 }]}>
                    <Text style={commonStyles.btnText}>Back to Sign In</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header1: {
    fontFamily: "Montserrat-Bold",
    fontSize: 50,
    textAlign: "center",
    marginTop: 30,
  },
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  resendBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    height: 70,
    backgroundColor: "black",
    borderRadius: 10,
  },
  infoBtn: {
    position: "absolute",
    right: 50,
  },
});

export default ConfirmEmail;