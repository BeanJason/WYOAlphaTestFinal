import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { TouchableOpacity } from "react-native";
import UserInput from "../../common/components/UserInput";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { PhoneNumberUtil } from "google-libphonenumber";
import { getEmailRegex } from "../../common/functions";
import { createToast } from "../../common/components/Toast";
import { Auth, DataStore } from "aws-amplify";
import { Manager } from "../../src/models";

//create manager
const CreateManager = ({ navigation }) => {

  //Set variables for user input
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  //Set use state variables
  const pwd = watch("password");
  const phone = watch('phoneNumber');
  const phoneUtil = PhoneNumberUtil.getInstance()


  //Submit the user input
  const submitForm = async (data) => {
    //check if birthday is over 18
      let isValid = phoneUtil.isValidNumber(phoneUtil.parse(data.phoneNumber, 'US'))
        if(!isValid){
          setError('phoneNumber', {
              type: 'validate',
              message: 'Please enter a valid phone number'
            })
        }
      else{
        data.email = data.email.trim();
        data.firstName = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1);
        data.lastName = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1);
        data.firstName = data.firstName.trim();
        data.lastName = data.lastName.trim();
        const authUser = await  Auth.signUp({username: data.email, password: data.password, attributes:{email: data.email, 'custom:type': 'Manager'}});
        if(authUser){
          try {
            await DataStore.save(
              new Manager({
                  "subID": authUser?.userSub,
                  "firstName": data.firstName,
                  "lastName": data.lastName,
                  "email": data.email,
                  "phoneNumber": data.phoneNumber
              })
          );
          createToast('Manager has been created')
          navigation.navigate("Home")
          } catch (error) {
            createToast('There was an error creating the account')
            console.log(error);
          }
        }
      }
  }

  return (
    <KeyboardAwareScrollView extraScrollHeight={20} keyboardShouldPersistTaps="handled">
      <ImageBackground
        style={[commonStyles.background, { height: 1100 }]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>

          <Text style={styles.header2}>
            Create a manager
          </Text>
          <View style={styles.inputContainer}>
            {/* first name */}
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                icon="user-circle"
                location="FontAwesome"
                name="firstName"
                rules={{ required: "First name is Required" }}
                placeholder={"First Name"}
                control={control}
              />
              {/* last name */}
              <UserInput
                style={styles.input}
                icon="user-circle"
                location="FontAwesome"
                name="lastName"
                rules={{ required: "Last name is Required" }}
                placeholder={"Last Name"}
                control={control}
              />
            </View>

            {/* email */}
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                icon="email"
                location="MaterialIcons"
                name="email"
                rules={{
                  required: "Email is Required",
                  pattern: { 
                    value: getEmailRegex(),
                    message: "Email must be valid address",
                  },
                }}
                placeholder={"Email Address"}
                control={control}
              />
            </View>

            <View style={styles.field}>
              {/* phone number */}
              <UserInput
                style={styles.input}
                name="phoneNumber"
                icon="phone"
                location="FontAwesome"
                onKeyPress
                maxLength={12}
                keyboardType="numeric"
                rules={{
                  required: "Phone Number is Required",
                }}
                placeholder={phone || "Phone Number"}
                control={control}
              />
            </View>

            {/* password */}
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                name="password"
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
                placeholder={"Password"}
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Home", {
                  name: "Home",
                })
              }
              style={[styles.button, styles.buttonOutline]}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>

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
    textAlign: "center",
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

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000090",
  },
  warningModal: {
    width: 350,
    height: 220,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: "black",
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: "center",
  },
  modalText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    padding: 5,
    borderBottomColor: "black",
    borderBottomWidth: 3,
    marginBottom: 5,
    alignSelf: "center",
    textAlign: "center",
    color: 'white'
  },
  modalBtn: {
    alignItems: "center",
    width: 100,
    height: 35,
    backgroundColor: "black",
    borderRadius: 8,
  }
});

export default CreateManager;
