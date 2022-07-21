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
  import { sendChangePasswordEmail } from "../../common/functions";


  const ChangePassword = ({ navigation }) => {
    //Set variables for user input
    const {
      control,
      watch,
      handleSubmit,
      formState: { errors },
      setError
    } = useForm();

    const { authUser, userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const pwd = watch("newPassword");
    
    //Submit the user input
    const submitForm = async (data) => {
      Auth.currentAuthenticatedUser().then(user => {
         return Auth.changePassword(user, data.oldPassword, data.newPassword)
      })
        .then(data => {
          if(authUser['custom:type'] == 'Provider'){
            sendChangePasswordEmail(authUser.email, userInfo.firstName)
            navigation.navigate('EditAccountProvider',{name: 'EditAccountProvider'})
          } else if(authUser['custom:type'] == 'Manager'){
            sendChangePasswordEmail(authUser.email, userInfo.firstName)
            navigation.navigate('EditAccountManager',{name: 'EditAccountManager'})
          }
          else{
            sendChangePasswordEmail(authUser.email, userInfo.firstName)
            navigation.navigate('EditAccountUser',{name: 'EditAccountUser'})
          }
        }).catch(error => {
          if(error.message == 'Incorrect username or password.'){
            setError("oldPassword", {
              type: "mismatch",
              message: "Incorrect username or password",
            });
          }
        })
    };

    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header2}>Enter your new password</Text>
          <View style={styles.inputContainer}>
            <View style={styles.field}>
            <UserInput
                style={styles.input}
                name="oldPassword"
                icon="lock"
                location="MaterialIcons"
                rules={{
                  required: "Old password is Required",
                }}
                placeholder={"Old Password"}
                control={control}
                secureTextEntry
              />
            </View>
              {/* password */}
              <View style={styles.field}>
                <UserInput
                  style={styles.input}
                  name="newPassword"
                  icon="lock"
                  location="MaterialIcons"
                  rules={{
                    required: "Password is Required",
                    maxLength: {
                      value: 15,
                      message: "Password cannot be more than 15 characters",
                    },
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                      message:
                        "Password must contain 1 uppercase letter 1 lowercase letter and 1 number",
                    },
                  }}
                  placeholder={"New Password"}
                  control={control}
                  secureTextEntry
                />

                <UserInput
                style={styles.input}
                name="confirmPassword"
                icon="lock"
                location="MaterialIcons"
                rules={{
                  required: "Password is Required",
                  validate: (value) =>
                    value === pwd || "The passwords do not match",
                }}
                placeholder={"Confirm Password"}
                control={control}
                secureTextEntry
              />
              </View>
          </View>

          <View style={{alignItems: 'center'}}>
            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={styles.button}
            >
              <Text style={styles.btnText}>Change</Text>
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

export default ChangePassword;