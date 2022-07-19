import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    SafeAreaView,
    FlatList,
    Modal,
    Dimensions,
    TouchableOpacity
  } from "react-native";
  import UserInput from "../../common/components/UserInput";
  import Spinner from "../../common/components/Spinner";
  import { commonStyles } from "../../common/styles";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { useEffect, useState } from "react";
  import { DataStore } from "aws-amplify";
  import { Manager, User } from "../../src/models";
  import { changeUserInfo } from "../../redux/authReducer";
  import {createToast} from "../../common/components/Toast"
  import { PhoneNumberUtil } from "google-libphonenumber";
  
  //Login screen
  const EditAccountManager = ({ navigation }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const [phoneNumber, setphoneNumber] = useState(userInfo.phoneNumber)
    const dispatch = useDispatch();
    const phoneUtil = PhoneNumberUtil.getInstance()
  
    //Set variables for user input
    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
    } = useForm();
  
    //change phone number
    const submitData = async (data) => {
        let isValid = phoneUtil.isValidNumber(phoneUtil.parse(data.phoneNumber, 'US'))
        if(!isValid){
            setError('phoneNumber', {
                type: 'validate',
                message: 'Please enter a valid phone number'
              })
        }
        else{
            const original = await DataStore.query(Manager, userInfo.userID);
              try {
                let res = await DataStore.save(
                  Manager.copyOf(original, (updated) => {
                    updated.phoneNumber = data.phoneNumber
                  })
                );
                if(res){
                    let newInfo = {
                      userID: original.id,
                      firstName: original.firstName,
                      lastName: original.lastName,
                      phoneNumber: data.phoneNumber,
                    };
                    dispatch(changeUserInfo({ userInfo: newInfo }));
                    setphoneNumber(data.phoneNumber);
                    createToast('Phone number has been changed')
                }
              } catch (error) {
                setError('phoneNumber', {
                  type: 'validate',
                  message: 'Please enter a valid phone number'
                })
                }
        }
    };
  
    return (
      <ImageBackground
        style={[commonStyles.background, { flex: 1 }]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
  
          <View style={styles.inputContainer}>
              <Text style={styles.nameText}>{userInfo.firstName} {userInfo.lastName}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ChangePassword", {name: "ChangePassword"})} style={[styles.passwordBtn, {marginTop: 20}]}>
                  <Text style={styles.editText}>Change Password</Text>
              </TouchableOpacity>
          </View>
  
          <View style={[styles.inputContainer, {marginTop: 10}]}>
            {/* phone number */}
            <Text style={styles.generalText}>Edit your phone number below</Text>
            <UserInput
              style={styles.input}
              name="phoneNumber"
              icon="phone"
              location="FontAwesome"
              onKeyPress
              maxLength={12}
              keyboardType="numeric"
              placeholder={phoneNumber}
              control={control}
            />
            <TouchableOpacity onPress={handleSubmit(submitData)} style={styles.button}>
              <Text style={styles.btnText}>Change</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  };
  
  const styles = StyleSheet.create({
    addressContainer: {
      borderColor: "rgba(0,221,255,0.9)",
      borderWidth: 1,
      backgroundColor: "rgba(0,221,255,0.9)",
      borderRadius: 10,
      padding: 10,
      width: Dimensions.get("window").width,
      marginVertical: 10,
      elevation: 10,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    inputContainer: {
      alignItems: "center",
      borderColor: "rgba(0,221,255,0.7)",
      borderWidth: 1,
      backgroundColor: "rgba(0,221,255,0.7)",
      borderRadius: 10,
      padding: 10,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: "column",
    },
    input: {
      width: 300,
      height: 32,
      fontSize: 16,
    },
    generalText: {
      fontFamily: "Montserrat-Regular",
      fontSize: 18,
      fontWeight: "800",
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
      fontSize: 18,
    },
    addressText: {
      textAlign: "center",
      marginTop: 20,
      borderBottomWidth: 2,
      alignSelf: "center",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#00000090",
    },
    warningModal: {
      width: 350,
      height: 300,
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
      fontFamily: "Montserrat-Regular",
      fontSize: 17,
      padding: 5,
      borderBottomColor: "black",
      borderBottomWidth: 3,
      marginBottom: 5,
      alignSelf: "center",
      textAlign: "center",
    },
    nameText: {
      fontFamily: "Montserrat-Bold",
      fontSize: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    passwordBtn: {
      justifyContent: "center",
      alignItems: "center",
      width: 150,
      height: 35,
      backgroundColor: "black",
      borderRadius: 10,
      marginVertical: 10,
    },
    editText: {
      color: "white",
      fontFamily: "Montserrat-Bold",
      fontSize: 15,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
  export default EditAccountManager;
  