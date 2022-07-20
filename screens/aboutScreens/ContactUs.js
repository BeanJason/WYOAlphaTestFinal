import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import UserInput from "../../common/components/UserInput";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Spinner from "../../common/components/Spinner";
import { API, graphqlOperation } from "aws-amplify";
import { contactUsFunction } from "../../src/graphql/mutations";
import { createToast } from "../../common/components/Toast";

const ContactUs = ({ navigation }) => {
  const [loading, setLoading] = useState(false)

  //Set variables for user input
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  //Submit the user input
  const submitForm = async (data) => {
    setLoading(true)
    const response = await API.graphql(graphqlOperation(contactUsFunction, {
      name: data.name,
      email: data.email,
      message: data.message
    }))
    if(response.data == 'success'){
      createToast('Message successfully sent')
    }
    setLoading(false)
    navigation.goBack()
  };

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header2}>Contact Us</Text>
          <View style={styles.inputContainer}>
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                icon="user-circle"
                location="FontAwesome"
                name="name"
                rules={{ required: "Name is Required" }}
                placeholder={"Name"}
                control={control}
              />
              <UserInput
                style={styles.input}
                icon="email"
                location="MaterialIcons"
                name="email"
                rules={{ 
                  required: "Email is Required" ,
                  pattern: {
                    value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
                    message: "Email must be valid address",
                  },
                }}
                placeholder={"Email"}
                control={control}
              />
              </View>
            <View style={styles.field}>
              {/* Description */}
              <UserInput
                style={[styles.input, { height: 120, textAlignVertical: "top", width: 350}]}
                name="message"
                multiline
                rules={{
                  required : "Message is a required field",
                  maxLength: {
                    value: 350,
                    message: "Message must be 350 words or less",
                  },
                }}
                placeholder={"Message"}
                control={control}
              />
            </View>
            <View style={{alignItems: 'center'}}>
            {loading ? <Spinner/> : (
              <TouchableOpacity
                onPress={handleSubmit(submitForm)}
                style={[styles.button, {marginTop: 20}]}
              >
                <Text style={[styles.btnText]}>
                  Submit
                </Text>
              </TouchableOpacity>
              )}
            </View>
          </View>

        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 20,
  },
  input: {
    width: 300,
    height: 32,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  field: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
  },
});

export default ContactUs;
