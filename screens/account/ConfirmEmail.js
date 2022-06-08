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
import { useDispatch, useSelector } from "react-redux";
import { createToast } from "../../common/components/Toast";
import { logout, resetState, setUserVerified } from "../../redux/authReducer";
import { Auth } from "aws-amplify";

//Email verification screen after successful registration or if not verified yet
const ConfirmEmail = ({ navigation }) => {
  //get userInfo
  const { authUser } = useSelector((state) => state.auth);

  //Set the dispatch to use functions from the redux reducers file
  const dispatch = useDispatch();

  //Set the user input variables
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  //Submit the user input
  const submitForm = async (data) => {
    try {
      await Auth.confirmSignUp(authUser.email, data.confirmationCode)
      dispatch(setUserVerified());
    } catch (error) {
      setError("confirmationCode", {
        type: "validate",
        message: "Incorrect confirmation code",
      });
    }
  };

  //Resend the confirmation code
  const resendCode = async () => {
    try {
      await Auth.resendSignUp(authUser.email)
      createToast("A new confirmation code was sent to your email");
    } catch (error) {
      createToast("Authentication failure");
    }
  };

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Success!</Text>
          <View style={styles.outerContainer}>
            <Text style={styles.header2}>
              We have sent a verification email to your email address {authUser.email}.
              Please verify that you've received the confirmation code below.
            </Text>

            <UserInput
              style={styles.input}
              name="confirmationCode"
              rules={{
                required: "Confirmation coode is Required",
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
                    dispatch(logout());
                    dispatch(resetState());
                  }}
                >
                  <View style={[styles.confirmBtn, { width: 200 }]}>
                    <Text style={styles.btnText}>Log Out</Text>
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