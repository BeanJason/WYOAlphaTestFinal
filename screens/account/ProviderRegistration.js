import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  SafeAreaView,
  ImageBackground,
  Modal
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
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete"
import { getNotificationToken } from "../../notifications";
import {GOOGLE_API} from "@env"

//Provider registration page
const ProviderRegistration = ({ navigation }) => {
  //Get the variables from the state management to read them
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  //Set the dispatch to use the functions in the redux reducer file
  const dispatch = useDispatch();

  //Set variables for user input
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  //Set use state variables
  const [birthdaySelected, setBirthdaySelected] = useState(false);
  const pwd = watch("password");
  const phone = watch('phoneNumber');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [birthDayError, setBirthdayError] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  //address variables
  const [address, setAddress] = useState()
  const [street, setStreet] = useState()
  const [city, setCity] = useState()
  const [zipCode, setZipCode] = useState()
  const [state, setState] = useState()
  const [lat, setLat] = useState()
  const [lng, setLng] = useState()
  const [addressError, setAddressError] = useState()

  //Anytime an error appears along with a message, display it on the screen
  useEffect(() => {
    if (isError) {
      if (message === 'An account with the given email already exists.') {
        setError("email", {
          type: "validate",
          message: "This email is already in use",
        });
      }
    }
    if(isSuccess){
      navigation.navigate('ConfirmEmail',{name: 'ConfirmEmail', type: 'Provider'})
    }
    //Reset the variable states after login or failed attempt
    dispatch(resetState());
  }, [isError, isSuccess, message, dispatch]);

  //On change for the birth date
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    setBirthdaySelected(true);
    setBirthdayError("");
  };

  //Submit the user input
  const submitForm = async (data) => {
    //check if birthday is over 18
    if (new Date().getFullYear() - date.getFullYear() >= 18) {
      if(address && street && city && zipCode && lat && lng){
        if(state != 'Michigan'){
          setAddressError('Your address must be in the state of Michigan')
        }
        else{
          data.type = "Provider";
          data.email = data.email.trim()
          data.dateOfBirth = date.toISOString().slice(0, 10)
          data.firstName = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)
          data.lastName = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1)
          data.firstName = data.firstName.trim()
          data.lastName = data.lastName.trim()
  
          let addressArray = {
            street: `${address} ${street}`,
            city: city,
            zipCode: zipCode,
            lat: lat,
            lng: lng
          };
          data.address = JSON.stringify(addressArray);
          dispatch(register(data))
        }
      }
      else{
        setAddressError('You must include a valid address')
       }
    } else {
      setBirthdayError("You must be 18 or older to use this app");
    }
  };

  //If login is loading from server side show the spinner
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <KeyboardAwareScrollView extraScrollHeight={20}>
      <ImageBackground
        style={[commonStyles.background, { height: 1300 }]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Modal
              visible={showModal}
              transparent
              animationType="slide"
              hardwareAccelerated
            >
              <View style={styles.centeredView}>
                <View style={styles.warningModal}>
                  <Text style={styles.modalTitle}>Select Your Address</Text>
                  <View style={{alignItems: 'center', borderBottomWidth: 1, marginBottom: 10, alignSelf: 'center'}}>
                    {/* Address */}
                    <GooglePlacesAutocomplete
                      placeholder="Address"
                      fetchDetails={true}
                      onPress={(data, details = null) => {
                        setAddress(details.address_components[0].long_name)
                        setStreet(details.address_components[1].long_name)
                        setCity(details.address_components[2].long_name)
                        setZipCode(details.address_components[6].long_name)
                        setState(details.address_components[4].long_name)
                        setLat(details.geometry.location.lat)
                        setLng(details.geometry.location.lng)
                      }}
                      query={{
                        key: GOOGLE_API,
                        language: "en",
                        components: "country:us",
                        type: "geocode"
                      }}
                      minLength={3}
                      styles={{
                        container: {width: 320, flex: 0, marginTop: 10},
                        textInput: {fontSize: 16, height: 50, borderRadius: 10, borderWidth: 1 },
                        listView: { backgroundColor: "white" },
                      }}
                    />
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={() => setShowModal(false)}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

          <Text style={styles.header2}>
            Create a provider account to start working with WYO today!
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
                    value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
                    message: "Email must be valid address",
                  },
                }}
                placeholder={"Email Address"}
                control={control}
              />
            </View>

            {/* DOB */}
            <View style={styles.field}>
              <View>
                <View>
                  <TouchableOpacity
                    onPress={() => setShow(true)}
                    style={[
                      commonStyles.inputBorder,
                      { flexDirection: "row", marginVertical: 5 },
                    ]}
                  >
                    <FontAwesome name="calendar" size={20} style={commonStyles.icon}/>
                    <TextInput style={[styles.input, { color: "black" }]} editable={false}
                    value={ birthdaySelected ? "Date of Birth: " + date.toLocaleDateString() : "Date of Birth" }
                    ></TextInput>
                  </TouchableOpacity>
                </View>
                {show && (
                  <DateTimePicker
                    value={date}
                    onChange={onChange}
                    mode="date"
                  />
                )}
              </View>
              {birthDayError ? (
                <Text style={commonStyles.errorMsg}>{birthDayError}</Text>) : ( <></> )}

              {/* phone number */}
              <UserInput
                style={styles.input}
                name="phoneNumber"
                icon="phone"
                location="FontAwesome"
                onKeyPress
                maxLength={12}
                keyboardType='numeric'
                rules={{
                  required: "Phone Number is Required",
                }}
                placeholder={phone || "Phone Number"}
                control={control}
              />
            </View>

           {/* Address */}
           <TouchableOpacity
              onPress={() => {setAddressError(''); setShowModal(true)}}
              style={styles.field}
            >
              <View style={[commonStyles.inputBorder, {flexDirection: 'row', width: 350, height: 50}]}>
                  <FontAwesome name="location-arrow" size={25} />
                <Text style={{alignSelf: 'center', fontSize: 16, padding: 5}}>
                  {address ? `${address} ${street} ${city} ${zipCode}` : 'Address'}
                </Text>
              </View>
            </TouchableOpacity>
            {addressError ? <Text style={commonStyles.errorMsg}>{addressError}</Text>: <></>}
           

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
            <View style={[styles.field, {flexGrow: 1}]}>
            <Text style={{fontFamily: "Montserrat-Bold"}}>Please give us a short biography (maximum 250 words) of how you are active in your community</Text>
              {/* Biography */}
              <UserInput
                style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
                name="biography"
                multiline
                rules={{ 
                    required: "Biography is required",
                    maxLength:{
                        value: 500,
                        message: 'Biography must be 500 characters or less'
                    } 
                  }}
                placeholder={"Biography"}
                control={control}
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RegistrationScreen", { name: "RegistrationScreen" })
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

export default ProviderRegistration;