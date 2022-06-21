import {
    StyleSheet,
    TextInput,
    Text,
    Image,
    View,
    ImageBackground,
    SafeAreaView,
  } from "react-native";
  import { TouchableOpacity } from "react-native";
  import UserInput from "../../../common/components/UserInput";
  import { commonStyles } from "../../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { DataStore } from "aws-amplify";
  import { User } from "../../../src/models";
  import { changeUserInfo } from "../../../redux/authReducer";
  
  //Login screen
  const AddAddress = ({ navigation }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    
    //Set variables for user input
    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
    } = useForm();
    
  
    //Submit the user input
    const submitForm = async (data) => {
        //Success
        data.address = data.address.trim()
        data.city = data.city.trim()
        let original = await DataStore.query(User, userInfo.userID);
        let newAddr = {
            street: data.address,
            city: data.city,
            zipCode: data.zipCode
        }
        let list = Array.from(original.address)
        list.push(JSON.stringify(newAddr))
        try {
            await DataStore.save(User.copyOf(original, updated => {
                updated.address.push(JSON.stringify(newAddr))
            }))
        } catch (error) {
            console.log(error);
        }

        let newInfo = {
            userID: original.id,
            firstName: original.firstName,
            lastName: original.lastName,
            address: list,
            phoneNumber: original.phoneNumber
        }
        dispatch(changeUserInfo({userInfo: newInfo}))
        navigation.reset({ routes: [{name: 'EditAccountUser2'}]})
        navigation.navigate('EditAccountUser2', {name: 'EditAccountUser2'})
    };
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
            <Text style={styles.header2}>
              Please provide your address details
            </Text>
  
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
    header2: {
      fontFamily: "Montserrat-Regular",
      fontSize: 22,
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
    durationStyle: {
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: "Black",
      paddingBottom: 5,
      justifyContent: "space-evenly",
  
    }
  });
  
  export default AddAddress;
  