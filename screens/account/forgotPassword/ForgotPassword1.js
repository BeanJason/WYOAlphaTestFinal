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
  import { commonStyles } from "../../../common/styles";
  import { createToast } from "../../../common/components/Toast";
  
  //Forgot password screen part 1. Enter the email to receive a confirmation code to reset your password
  const ForgotPassword1 = ({ navigation }) => {
    //Set the user input variables
    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
    } = useForm();
  
    //Submit the data from the user
    const submitForm = async (data) => {
        
    };
  
    return (
      <ImageBackground
        style={commonStyles.background}
        source={require("../../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Forgot Password?</Text>
          <Text style={styles.header2}>
            Please enter your email and we'll send you a confirmation code to
            reset your password
          </Text>
  
          <View style={styles.container}>
              <UserInput
                style={styles.input}
                icon='email'
                location='MaterialIcons'
                name="email"
                rules={{ required: "Email is Required" }}
                placeholder={"Email"}
                control={control}
              />
  
            {/* Buttons */}
            <View style={{ flexDirection: "row" }}>
              {/* Cancel */}
              <View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("LoginScreen", { name: "LoginScreen" })
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
                    <Text style={styles.btnText}>Send Email</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
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
      marginBottom: -15,
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
      width: 170,
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
  
  export default ForgotPassword1;