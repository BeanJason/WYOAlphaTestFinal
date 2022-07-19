import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    SafeAreaView,
    TouchableOpacity
  } from "react-native";
  import UserInput from "../../common/components/UserInput";
  import { commonStyles } from "../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useDispatch, useSelector } from "react-redux";
  import { Auth } from "aws-amplify";
  import { changeUserStatus } from "../../redux/authReducer";
  import { checkCredentials } from "../../credentials";
  import { useState } from "react";
  import Spinner from "../../common/components/Spinner";

  //Login screen
  const VerifyAccount = ({ navigation }) => {
    //Set variables for user input
    const {
      control,
      handleSubmit,
      formState: { errors },
      setError
    } = useForm();

    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    
    //Submit the user input
    const submitForm = async (data) => {
      setLoading(true)
     try {
        await Auth.signIn({username: authUser.email, password: data.password})
        const newData = await checkCredentials();
        if(newData.authUser != null && newData.userInfo != null){
          dispatch(changeUserStatus({authUser: newData.authUser, userInfo: newData.userInfo}))
        }
        if(authUser['custom:type'] == 'Provider'){
          navigation.navigate('EditAccountProvider',{name: 'EditAccountProvider'})
        }
        else if(authUser['custom:type'] == 'Manager'){
          navigation.navigate('EditAccountManager',{name: 'EditAccountManager'})
        }
        else{
          navigation.navigate('EditAccountUser',{name: 'EditAccountUser'})
        }
     } catch (error) {
      setError("password", {
        type: "mismatch",
        message: "Incorrect username or password",
      });
     }
     setLoading(false)
    };

    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header2}>Verify your password before editing your account</Text>
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

          <View style={{alignItems: 'center', marginTop: 10}}>
          {loading ? <Spinner color={'green'} /> : (
            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={styles.button}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          )}
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

export default VerifyAccount;