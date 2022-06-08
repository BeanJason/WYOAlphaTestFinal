import {
    StyleSheet,
    Text,
    Image,
    View,
    ImageBackground,
    SafeAreaView,
  } from "react-native";
  import { TouchableOpacity } from "react-native";
  import UserInput from "../../common/components/UserInput";
  import Spinner from "../../common/components/Spinner";
  import { commonStyles } from "../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { login, resetState } from "../../redux/authReducer";
  import { useEffect } from "react";
  
  //Login screen
  const EditAccountUser2 = ({ navigation }) => {

    //Set variables for user input
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm();
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>Edit your info accordingly below</Text>

          <View style={styles.inputContainer}>
            {/* phone number */}
            <UserInput
                style={styles.input}
                name="phoneNumber"
                icon='phone'
                location='FontAwesome'
                rules={{
                  required: "Phone Number is Required",
                  pattern: {
                    value:
                      /^\(?([0-9]{3})\)?[-.●. ]?([0-9]{3})[-.●. ]?([0-9]{4})$/,
                    message: "Must be a valid US number",
                  },
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
                location='FontAwesome'
                rules={{ required: "Zip Code is Required",
                pattern: {
                     value: /\d{5}/,
                     message: 'Zip code must be a valid 5 digit code'
                   },
                 }}
                placeholder={"Zip Code"}
                control={control}
              />
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
              onPress={handleSubmit()}
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
    inputContainer: {
      alignItems: "center",
      borderColor: "rgba(0,221,255,0.7)",
      borderWidth: 1,
      backgroundColor: "rgba(0,221,255,0.7)",
      borderRadius: 10,
      padding: 20,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: "column",
    },
  });
  
  export default EditAccountUser2;
  