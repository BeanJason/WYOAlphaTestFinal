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
import { commonStyles } from "../../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { checkCredentials } from "../../../credentials";
import { changeUserStatus, changeUserInfo } from "../../../redux/authReducer";
import { Provider } from "../../../src/models";
import { createToast } from "../../../common/components/Toast";
import { DataStore } from "aws-amplify";



//Login screen
const EditAccountProvider = ({ navigation }) => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
      reset
    } = useForm();

    const {
      control: control2, 
      handleSubmit: handleSubmit2,
      setError: setError2,
      reset: reset2
    } = useForm()

    //get updated info
    const getUpdatedInfo = async () => {
      const newData = await checkCredentials();
      if(newData.authUser != null && newData.userInfo != null){
        dispatch(changeUserStatus({authUser: newData.authUser, userInfo: newData.userInfo}))
      }
    };


    useEffect(() => {
      getUpdatedInfo()
    }, []);


    const submitPhone = async(data) => {
      let original = await DataStore.query(Provider, userInfo.userID);
      try {
          await DataStore.save(Provider.copyOf(original, updated => {
              updated.phoneNumber = data.phoneNumber
          }))
          reset({
            data: 'phoneNumber'
          })
          let newInfo = {
            userID: original.id,
            firstName: original.firstName,
            lastName: original.lastName,
            address: original.address,
            city: original.city,
            zipCode: original.zipCode,
            phoneNumber: data.phoneNumber,
            biography: original.biography,
            backgroundCheck: original.backgroundCheckStatus
        }
        dispatch(changeUserInfo({userInfo: newInfo}))
        createToast('Your phone number has been changed!')
      } catch (error) {
          console.log(error);
          setError("phoneNumber", {
            type: "validate",
            message: "Please enter a valid phone number",
          });
      }   
    }

    const submitBio = async(data) => {
      let original = await DataStore.query(Provider, userInfo.userID);
      try {
          await DataStore.save(Provider.copyOf(original, updated => {
              updated.biography = data.biography
          }))
          reset2({
            data: 'biography'
          })
          let newInfo = {
            userID: original.id,
            firstName: original.firstName,
            lastName: original.lastName,
            address: original.address,
            city: original.city,
            zipCode: original.zipCode,
            phoneNumber: original.phoneNumber,
            biography: data.biography,
            backgroundCheck: original.backgroundCheckStatus
        }
        dispatch(changeUserInfo({userInfo: newInfo}))
        createToast('Your biography has been changed!')
      } catch (error) {
          console.log(error);
          setError2("biography", {
            type: "validate",
            message: "Something went wrong while changing your biography.",
          });
      } 
    }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Edit account information</Text>
          <View style = {styles.inputContainer}>
          <View style={[styles.field ,{flexDirection: 'row', marginBottom: 20}]}>
            <Text style={[styles.generalText, {marginRight: 20}]}>Background Check Status:</Text>
            {userInfo.backgroundCheck ? <FontAwesome style={{color: 'green'}} name={'check-circle'} size={25} /> 
            : <FontAwesome style={{color: 'red'}} name={'times-circle'} size={25} />}
          </View>
            <Text style={styles.generalText}>Edit your phone number</Text>
            <View style={styles.field}>
              {/* Phone number */}
              <UserInput
                style={styles.input}
                name="phoneNumber"
                icon="phone"
                location="FontAwesome"
                onKeyPress
                maxLength={12}
                keyboardType="numeric"
                placeholder={userInfo.phoneNumber}
                control={control}
                rules={{required: 'No changes were made'}}
              />
              <TouchableOpacity onPress={handleSubmit(submitPhone)} style={styles.editBtn}>
                <Text style={styles.editText}>Change</Text>
              </TouchableOpacity>
            </View>
            {/* Biography */}
            <Text style={styles.generalText}>Edit your biography</Text>
            <View style={[styles.field, {flexGrow: 1}]}>
            <Text style={{fontFamily: "Montserrat-Bold"}}>Please give us a short biography (maximum 250 words) of how you are active in your community</Text>
              {/* Biography */}
              <UserInput
                style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
                name="biography"
                multiline
                rules={{ 
                    required: 'No changes were made',
                    maxLength:{
                        value: 250,
                        message: 'Biography must be 250 words or less'
                    } 
                  }}
                placeholder={userInfo.biography}
                control={control2}
              />
            </View>
            <TouchableOpacity onPress={handleSubmit2(submitBio)} style={styles.editBtn}>
                <Text style={styles.editText}>Change</Text>
              </TouchableOpacity>
          </View>

          {/* address */}
          <View style={[styles.inputContainer, {marginTop: 15}]}>
            <Text style={[styles.generalText, {textAlign: 'center', borderBottomWidth: 1, alignSelf: 'center'}]}>Current Address</Text>
            <Text style={styles.generalText}>{userInfo.address} {userInfo.city} {userInfo.zipCode}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("EditAddress", {name: "EditAddress"})} style={styles.editBtn}>
                <Text style={styles.editText}>Edit Address</Text>
              </TouchableOpacity>
            </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header1: {
    fontFamily: "Montserrat-Bold",
    fontSize: 50,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 20,
    flexDirection: 'row'
  },
  field: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
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
  editBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 110,
    height: 30,
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
  }
});

export default EditAccountProvider;
