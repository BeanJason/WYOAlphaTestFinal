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
  import { DataStore } from "aws-amplify";
  import { Job } from "../../src/models";
  
  //Login screen
  const JobCreationPayment = ({route, navigation }) => {
    const {data, userInfo} = route.params

    const submitForm = async () => {
        try {
          // await DataStore.save(
          //   new Job({
          //     jobTitle: data.jobTitle,
          //     jobDescription: data.jobDescription,
          //     currentStatus: data.currentStatus,
          //     address: data.address,
          //     city: data.city,
          //     zipCode: data.zipCode,
          //     duration: data.duration,
          //     requestDateTime: data.requestDateTime,
          //     requestOwner: userInfo.userID, //sub id of user
          //   }));
            navigation.navigate('Home', {name: 'Home'})
      } catch (error) {
        console.log(error);
      }
    }
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>This is the job creation page part 2</Text>

          <TouchableOpacity
              onPress={submitForm}
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
    
  });
  
  export default JobCreationPayment;
  