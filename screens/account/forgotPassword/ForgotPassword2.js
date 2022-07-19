import {
    StyleSheet,
    Text,
    SafeAreaView,
    ImageBackground,
    View,
    TouchableOpacity,
  } from "react-native";
  import { useForm } from "react-hook-form";
  import UserInput from "../../../common/components/UserInput";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { commonStyles } from "../../../common/styles";
  import { useState } from "react";
  import { Auth } from "aws-amplify";
import { sendChangePasswordEmail } from "../../../common/functions";
  
  //Forgot password part 2. Enter the confirmation code and your new password twice
  const ForgotPassword2 = ({ route, navigation }) => {
    //Used to show or reveal the buttons to resend verification and submit
    const [shouldShow, setShouldShow] = useState(true);
  
    const {
      control,
      handleSubmit,
      watch,
      formState: { errors },
      setError,
    } = useForm();
  
    //Watch the password field
    const pwd = watch("password");
  
    //get email from previous page
    const { email } = route.params;
  
    //Submit the user input
    const submitForm = async (data) => {
      try {
        await Auth.forgotPasswordSubmit(email, data.token, data.password)
        setShouldShow(false)
        sendChangePasswordEmail(email)
      } catch (error) {
        console.log(error.message);
        setError('token', {
          type: 'validate',
          message: 'Incorrect confirmation code'
        })
      }
      
    };
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
            <Text style={styles.header1}>Forgot Password?</Text>
  
            {/* check if should show or hide */}
            {shouldShow ? (
              <View style={styles.container}>
                <Text style={styles.header2}>
                  A confirmation code was sent to your email at {email}, please enter your confirmation code and new password
                </Text>
                <UserInput
                  style={styles.input}
                  name="token"
                  rules={{ required: "Confirmation code is Required" }}
                  placeholder={"Confirmation Code"}
                  control={control}
                />
                  <UserInput
                    style={styles.input}
                    name="password"
                    icon="lock" 
                    location="MaterialIcons"
                    rules={{
                      required: "Password is Required",
                      maxLength: {
                        value: 15,
                        message: 'Password cannot be more than 15 characters'
                      },
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern:{
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                        message: 'Password must contain 1 uppercase letter 1 lowercase letter and 1 number'
                      }
                    }}
                    placeholder={"Password"}
                    control={control}
                    secureTextEntry
                  />
                  <UserInput
                    style={styles.input}
                    icon="lock" 
                    location="MaterialIcons"
                    name="password2"
                    rules={{
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === pwd || "The passwords do not match",
                    }}
                    placeholder={"Confirm Password"}
                    control={control}
                    secureTextEntry
                  />
  
                {/* Buttons */}
                <View style={{ flexDirection: "row" }}>
                  {/* Cancel */}
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("LoginScreen", {
                          name: "LoginScreen",
                        })
                      }
                    >
                      <View style={styles.sendButton}>
                        <Text style={styles.btnText}>Cancel</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
  
                  {/* Send */}
                  <View>
                    <TouchableOpacity onPress={handleSubmit(submitForm)}>
                      <View style={styles.sendButton}>
                        <Text style={styles.btnText}>Confirm</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.header2}>
                  Password was changed successfully
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("LoginScreen", { name: "LoginScreen" })
                  }
                >
                  <View style={styles.returnButton}>
                    <Text style={styles.btnText}>Return Home</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
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
      marginTop: 10,
    },
    header2: {
      fontFamily: "Montserrat-Regular",
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    container: {
      alignItems: "center",
      marginVertical: 50,
      borderColor: "rgba(0,221,255,0.7)",
      borderWidth: 1,
      backgroundColor: "rgba(0,221,255,0.7)",
      borderRadius: 10,
      padding: 30,
    },
    input: {
      width: 320,
      height: 40,
      fontSize: 20,
    },
    sendButton: {
      justifyContent: "center",
      alignItems: "center",
      width: 150,
      height: 50,
      backgroundColor: "black",
      borderRadius: 10,
      marginVertical: 30,
      marginHorizontal: 5,
    },
    returnButton: {
      justifyContent: "center",
      alignItems: "center",
      width: 200,
      height: 50,
      backgroundColor: "black",
      borderRadius: 10,
      marginVertical: 30,
      marginHorizontal: 5,
    },
    btnText: {
      color: "white",
      fontFamily: "Montserrat-Bold",
      fontSize: 25,
    },
  });
  
  export default ForgotPassword2;