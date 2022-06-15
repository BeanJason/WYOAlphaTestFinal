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
  
  //Login screen
  const EditAccountUser1 = ({ navigation }) => {
    //Set variables for user input
    const {
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
      setError
    } = useForm();
    
    //Submit the user input
    const submitForm = (data) => {
      //check if birthday is over 18
      if(new Date().getFullYear() - date.getFullYear() >= 18){
        data.type = 'User'
        data.email = data.email.trim()
        data.dateOfBirth = date.toISOString().slice(0, 10)
        data.firstName = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)
        data.lastName = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1)
        data.firstName = data.firstName.trim()
        data.lastName = data.lastName.trim()
        data.address = data.address.trim()
        data.city = data.city.trim()
        let addressArray = [{
          count: 1,
          street: data.address,
          city: data.city,
          zipCode: data.zipCode
        }]
        data.address = addressArray
        dispatch(register(data))
        navigation.navigate('ConfirmEmail',{name: 'ConfirmEmail'})
      }
      else{
        setBirthdayError('You must be 18 or older to use this app')
      }
    
    };

    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>This is the edit account page for the user</Text>
          <View style={styles.inputContainer}>
              {/* phone number */}
              <View style={styles.field}>
                <UserInput
                  style={styles.input}
                  name="phoneNumber"
                  icon='phone'
                  location='FontAwesome'
                  onKeyPress
                  maxLength={12}
                  keyboardType="numeric"
                  rules={{
                    required: "Phone Number is Required",
                  }}
                  placeholder={"Phone Number"}
                  control={control}
                />
              </View>

            {/* address */}
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                icon='address-card-o'
                location='FontAwesome'
                name="address"
                rules={{ required: "Address is Required" }}
                placeholder={"Address"}
                control={control}
              />
              {/* city */}
              <UserInput
                style={styles.input}
                icon='location-city'
                location='MaterialIcons'
                name="city"
                rules={{
                   required: "City is Required",
                   pattern: {
                     value: /^[a-zA-Z ]+$/,
                     message: 'Only letters are allowed in the city name'
                   }}}
                placeholder={"City"}
                control={control}
              />
              {/* zip code */}
              <UserInput
                style={{ fontSize: 16 }}
                name="zipCode"
                icon='location-arrow'
                keyboardType="numeric"
                location='FontAwesome'
                maxLength={5}
                rules={{ 
                  required: "Zip Code is Required",
                  pattern: {
                    value: /\d{5}/,
                    message: 'Zip code must be a valid 5 digit code'
                  }
                }}
                placeholder={"Zip Code"}
                control={control}
              />
            </View>

            
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserHome", { name: "UserHome" })
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