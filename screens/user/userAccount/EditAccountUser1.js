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
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>This is the edit account page for the user</Text>
      


          </SafeAreaView>
        </ImageBackground>
      </KeyboardAwareScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    
  });
  
  export default EditAccountUser1;
  