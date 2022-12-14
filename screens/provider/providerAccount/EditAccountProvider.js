import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  Platform,
  Switch
} from "react-native";
import { TouchableOpacity } from "react-native";
import UserInput from "../../../common/components/UserInput";
import { commonStyles } from "../../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { changeProviderPicture, changeUserInfo } from "../../../redux/authReducer";
import { Provider } from "../../../src/models";
import { createToast } from "../../../common/components/Toast";
import { DataStore, Storage } from "aws-amplify";
import * as ImagePicker from "expo-image-picker"
import ProfilePicture from "../../../common/components/ProfilePicture";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useEffect } from "react";



const EditAccountProvider = ({ navigation }) => {
    const dispatch = useDispatch();
    const { userInfo, profilePicture } = useSelector((state) => state.auth);
    const [imageUploading, setImageUploading] = useState(false)
    const [checkExpires, setCheckExpires] = useState()
    const phoneUtil = PhoneNumberUtil.getInstance()
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(userInfo.isNotificationsOn);

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

    useEffect(() => {
      let date = new Date(userInfo.backgroundCheckDate)
      date.setFullYear(date.getFullYear() + 1)
      setCheckExpires(date.toDateString())
    },[])


    const getAddress = () => {
      let arr = JSON.parse(userInfo.address)
      return `${arr.street} ${arr.city} ${arr.zipCode}`
    }

    const submitPhone = async(data) => {
    let isValid = phoneUtil.isValidNumber(phoneUtil.parse(data.phoneNumber, 'US'))
      if(!isValid){
        setError('phoneNumber', {
            type: 'validate',
            message: 'Please enter a valid phone number'
          })
      }
      else{
        let original = await DataStore.query(Provider, userInfo.id);
        try {
            let newInfo = await DataStore.save(Provider.copyOf(original, updated => {
                updated.phoneNumber = data.phoneNumber
            }))
            reset({
              data: 'phoneNumber'
            })
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
    }

    const submitBio = async(data) => {
      let original = await DataStore.query(Provider, userInfo.id);
      try {
          let newInfo = await DataStore.save(Provider.copyOf(original, updated => {
              updated.biography = data.biography
          }))
          reset2({
            data: 'biography'
          })
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


    // Profile picture functions
    //get camera permissions
    const getPermissions = async() => {
      if(Platform.OS == 'ios' || Platform.OS == 'android'){
        
        const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        if(libraryResponse.status == 'granted' || photoResponse.status == 'granted'){
          return true
        }
        return false
      }
    }
    //allow user to pick an image from gallery
    const pickImage = async() => {
      if(await getPermissions()){
        setImageUploading(true)
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
          aspect: [4, 3],
          quality: 1,
        });
        await handleImagePicked(result)
      }
      else{
        createToast("Sorry, we need camera permissions to make this work!");
      }
    }

    //create blob from image uri
    const fetchImageFromUri = async (uri) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob;
    };

    const uploadImage = async (name, image) => {
      console.log('attempting to upload image to s3');
      let pictureUrl
      try {
        pictureUrl = await Storage.put(name +'.png', image, {
          contentType: "image/jpeg",
        })
        
      } catch (error) {
        console.log(error);
      }
      
      if(pictureUrl){
        let original = await DataStore.query(Provider, userInfo.id);
        try {
          let newInfo = await DataStore.save(Provider.copyOf(original, updated => {
            updated.profilePictureURL = pictureUrl.key
        }))
          let newPicture = await Storage.get(pictureUrl.key)
          dispatch(changeUserInfo({userInfo: newInfo}))
          dispatch(changeProviderPicture(newPicture))
          setImageUploading(false)
          createToast('Your profile picture has been changed')
        } catch (error) {
          console.log(error);
        }
      }

    }

    //handle image once chosen
    const handleImagePicked = async(pickerResult) => {
      try {
        if (pickerResult.cancelled) {
          createToast("Upload cancelled");
          setImageUploading(false)
          return;
        } else {
          const img = await fetchImageFromUri(pickerResult.uri);
          await uploadImage(userInfo.id, img);
        }
      } catch (e) {
        console.log(e);
        createToast("Upload failed");
        setImageUploading(false)
      }
    }


    //change notifications
    const toggleSwitch = async() => {
      let value = !isNotificationsEnabled
      let original = await DataStore.query(Provider, userInfo.id)
      try {
        let newInfo = await DataStore.save(Provider.copyOf(original, (updated) => {
          updated.isNotificationsOn = value
        }))
        dispatch(changeUserInfo({userInfo: newInfo}))
      } catch (error) {
        console.log(error);
        createToast('There was an error updating your request')
      }
      if(value){
        createToast('Notifications have been turned on')
      }
      else{
        createToast('Notifications have been turned off')
      }
      setIsNotificationsEnabled(value)
    }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1050}]}
        source={require("../../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Account Information</Text>
          {/* Profile Picture */}
          <View style={[{flexDirection: 'row', marginBottom: 20, justifyContent: 'center'}]}>
          
            <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
              <ProfilePicture imageUrl={profilePicture} loading={imageUploading} name={`${userInfo.firstName} ${userInfo.lastName}`} size={150}/>
            </TouchableOpacity>

            <View style={{justifyContent: 'center', padding: 10}}>
              <Text style={{fontSize: 26, fontFamily: 'Montserrat-Bold'}}>{userInfo.firstName} {userInfo.lastName}</Text>
              <View style={{flexDirection: 'row', marginTop: 15}}>
                <Text style={[styles.generalText, {marginRight: 5}]}>Background Check:</Text>
                {userInfo.backgroundCheckStatus ? <FontAwesome style={{color: 'green'}} name={'check-circle'} size={25} /> 
                : <FontAwesome style={{color: 'red'}} name={'times-circle'} size={25} />}
              </View>
              <Text style={styles.generalText}>Expires: {checkExpires}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ChangePassword", {name: "ChangePassword"})} style={styles.passwordBtn}>
                <Text style={styles.editText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Information */}
          <View style = {styles.inputContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start'}}>
              <Text style={styles.generalText}>New Job Notifications</Text>
              <Switch
                style={{marginLeft: 1}}
                trackColor={{ false: "#767577", true: "green" }}
                value={isNotificationsEnabled}
                onValueChange={toggleSwitch}
              />
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
            <Text style={styles.generalText}>{getAddress()}</Text>
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
  },
  passwordBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 140,
    height: 35,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default EditAccountProvider;
