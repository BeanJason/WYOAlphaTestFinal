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
import { Auth } from "aws-amplify";
import { sendProviderEmail } from "../../common/functions";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetState } from "../../redux/authReducer";

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
        createToast("Your email has been verified, an email was sent to you with further instructions");
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
          <View style={styles.outerContainer}>
            <Text style={styles.header2}>
              We have sent a verification email to your email address.
              Please verify that you've received the confirmation code below.
            </Text>

            <UserInput
              style={styles.input}
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
              style={[styles.input, {width: 360}]}
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
              <View style={styles.innerContainer}>
                <TouchableOpacity onPress={handleSubmit(submitForm)}>
                  <View style={styles.confirmBtn}>
                    <Text style={styles.btnText}>Confirm</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Resend Button */}
              <View style={[styles.innerContainer, { marginVertical: 30 }]}>
                <Text style={styles.header2}>Didnt receive a code?</Text>
                <TouchableOpacity onPress={resendCode}>
                  <View style={styles.resendBtn}>
                    <Text style={styles.btnText}>Re-send Confirmation</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Return button */}
              <View style={[styles.innerContainer, { marginVertical: -10 }]}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('LoginScreen', {name: 'LoginScreen'})
                  }}
                >
                  <View style={[styles.confirmBtn, { width: 250 }]}>
                    <Text style={styles.btnText}>Back to Sign In</Text>
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
  logoContainer: {
    alignItems: "center",
  },
  resendBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    height: 70,
    backgroundColor: "black",
    borderRadius: 10,
  },
  confirmBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  infoBtn: {
    position: "absolute",
    right: 50,
  },
  outerContainer: {
    alignItems: "center",
    marginVertical: 50,
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 30,
  },
  innerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    height: 40,
    fontSize: 20,
  },
});

export default ConfirmEmail;