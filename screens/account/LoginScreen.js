import {
  StyleSheet,
  Text,
  Image,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
// import { TouchableOpacity } from "react-native-gesture-handler";
import UserInput from "../../common/components/UserInput";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { login, resetState } from "../../redux/authReducer";
import { useEffect } from "react";

//Login screen
const LoginScreen = ({ navigation }) => {
  //Get the variables from the state management to read them
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  //Set the dispatch to use the functions in the redux reducer file
  const dispatch = useDispatch();

  //Set the variables for the user input
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  //Anytime an error appears along with a message, display it on the screen
  useEffect(() => {
    if (isError) {
      if (message === "User is not confirmed.") {
        navigation.navigate("ConfirmEmail", {
          name: "ConfirmEmail",
        });
      }
      setError("email", {
        type: "mismatch",
        message: "Incorrect username or password",
      });
      setError("password", {
        type: "mismatch",
        message: "Incorrect username or password",
      });
    }
    //Reset the variable states after login or failed attempt
    dispatch(resetState());
  }, [isError, isSuccess, message, dispatch]);

  //Submit the user form
  const submitForm = (data) => {
    data.email = data.email.trim();
    dispatch(login(data));
  };

  //If login is loading from server side show the spinner
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, { height: 1000 }]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          {/* LOGO */}
          <Text style={styles.header1}>Welcome!</Text>
          <View style={styles.logoContainer}>
            <Image
              style={commonStyles.logo}
              source={require("../../assets/Logo.png")}
            />
          </View>
          <View style={styles.loginContainer}>
            <UserInput
              style={styles.input}
              icon="email"
              location="MaterialIcons"
              name="email"
              rules={{ required: "Email is Required" }}
              placeholder={"Email"}
              control={control}
            />
            <UserInput
              style={styles.input}
              icon="lock"
              location="MaterialIcons"
              name="password"
              rules={{ required: "Password is required" }}
              placeholder={"Password"}
              control={control}
              secureTextEntry
            />

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={handleSubmit(submitForm)}>
                <View style={styles.loginButton}>
                  <Text style={styles.btnText}>Login</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginTop: 10}}>
              <Text style={styles.regularText}>Dont have an account?</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("RegistrationScreen", {
                    name: "Registration",
                  })
                }
              >
                <Text style={[{ color: "blue", marginLeft: 5 }, styles.regularText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Forgot password link */}
            <TouchableOpacity
              onPress={() =>
                // TODO: NAVIGATE TO FORGOT PASSWORD SCREEN
                navigation.navigate("ForgotPassword1", {
                  name: "ForgotPassword1",
                })
              }
            >
              <Text
                style={[{ color: "blue", marginTop: 10 }, styles.regularText]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                marginTop: 30,
              }}
            >
              {/* About us link */}
              <TouchableOpacity
                onPress={() =>
                  // TODO: NAVIGATE TO FORGOT PASSWORD SCREEN
                  navigation.navigate("AboutUs", {
                    name: "About Us",
                  })
                }
                style={{marginRight: 10}}
              >
                <Text style={[{ color: "black" }, styles.regularText]}>
                  About
                </Text>
              </TouchableOpacity>
              {/* Contact Us */}
              <TouchableOpacity
                onPress={() =>
                  // TODO: NAVIGATE TO FORGOT PASSWORD SCREEN
                  navigation.navigate("AboutUs", {
                    name: "About Us",
                  })
                }
              >
                <Text style={[{ color: "black" }, styles.regularText]}>
                  Contact Us
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 30,
    marginTop: 20,
  },
  header1: {
    fontFamily: "Montserrat-Bold",
    fontSize: 50,
    textAlign: "center",
    marginTop: 25,
  },
  input: {
    width: 320,
    height: 40,
    fontSize: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
  },
  regularText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default LoginScreen;
