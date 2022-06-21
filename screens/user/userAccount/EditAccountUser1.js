import {
    StyleSheet,
    Text,
    Image,
    View,
    ImageBackground,
    SafeAreaView,
  } from "react-native";
  import { TouchableOpacity } from "react-native";
  import UserInput from "../../../common/components/UserInput";
  import Spinner from "../../../common/components/Spinner";
  import { commonStyles } from "../../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { login, resetState } from "../../../redux/authReducer";
  import { useEffect } from "react";
import { Auth } from "aws-amplify";
import { checkCredentials } from "../../../credentials";
  
  //Login screen
  const EditAccountUser1 = ({ navigation }) => {
    //Set variables for user input
    const {
      control,
      handleSubmit,
      formState: { errors },
      setError
    } = useForm();

    const { authUser } = useSelector((state) => state.auth);
    
    //Submit the user input
    const submitForm = async (data) => {
     try {
       await Auth.signIn({username: authUser.email, password: data.password})
       checkCredentials();
        navigation.navigate('EditAccountUser2',{name: 'EditAccountUser2'})
     } catch (error) {
      setError("password", {
        type: "mismatch",
        message: "Incorrect username or password",
      });
     }
     
    
    };

    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>Enter your password to verify yourself</Text>
          <View style={styles.inputContainer}>
              {/* password */}
              <View style={styles.field}>
                <UserInput
                  style={styles.input}
                  name="password"
                  icon='lock'
                  location='MaterialIcons'
                  rules={{
                    required: "Password is Required",
                  }}
                  placeholder={"Password"}
                  control={control}
                  secureTextEntry
                />
              </View>
          </View>
          <View style={styles.buttonContainer}>

            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={styles.button}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: 'center'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
  },
  input: {
    width: 300,
    height: 32,
    fontSize: 16,
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 20,
  },
  field: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
  },
});

export default EditAccountUser1;