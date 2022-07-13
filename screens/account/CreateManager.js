import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  SafeAreaView,
  ImageBackground,
  Modal,
} from "react-native";
import { TouchableOpacity } from "react-native";
import UserInput from "../../common/components/UserInput";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector, useDispatch } from "react-redux";
import { register, resetState } from "../../redux/authReducer";
import { FontAwesome } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { getNotificationToken } from "../../notifications";
import { Auth } from "aws-amplify";
import { DataStore } from "aws-amplify";
import { Manager } from "../../src/models";

//User registration page
const CreateManager = ({ navigation }) => {
 
    //Submit the user input
  const submitForm = async () => {
    console.log('create');
    const authUser = await Auth.signUp({username: 'kassimballout11@hotmail.com', password: 'Testing1', attributes:{email: 'kassimballout11@hotmail.com', 'custom:type': 'Manager'}});

    try {
        await DataStore.save(
            new Manager({
                "subID": authUser?.userSub,
                "firstName": "Kristen",
                "lastName": "Pfeifer",
                "email": "kassimballout11@hotmail.com",
                "phoneNumber": "313-414-0326"
            })
        );
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <KeyboardAwareScrollView extraScrollHeight={20} keyboardShouldPersistTaps="handled">
      <ImageBackground
        style={[commonStyles.background, { height: 1100 }]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
            <TouchableOpacity
              onPress={() => submitForm()}
              style={styles.button}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
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
