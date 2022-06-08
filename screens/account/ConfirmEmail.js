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
import { useDispatch } from "react-redux";
import { createToast } from "../../common/components/Toast";
import { Auth } from "aws-amplify";
import { checkCredentials } from "../../credentials";

//Email verification screen after successful registration or if not verified yet
const ConfirmEmail = ({ navigation }) => {

  //Set the dispatch to use functions from the redux reducers file
  const dispatch = useDispatch();

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
      await Auth.confirmSignUp(data.email, data.confirmationCode)
      const {authUser, userInfo} = await checkCredentials()
      dispatch(changeUserStatus({authUser, userInfo}))
    } catch (error) {
      console.log(error);
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

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1000}]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Success!</Text>
          <View style={styles.outerContainer}>
            <Text style={styles.header2}>
              We have sent a verification email to your email address.
              Please verify that you've received the confirmation code below.
            </Text>

            <UserInput
              style={styles.input}
              name="email"
              rules={{
                required: "email is Required",
              }}
              placeholder={"Email"}
              control={control}
            />

            <UserInput
              style={styles.input}
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
    width: 350,
    height: 40,
    fontSize: 20,
  },
});

export default ConfirmEmail;