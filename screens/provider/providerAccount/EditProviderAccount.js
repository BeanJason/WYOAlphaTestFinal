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
import { logout } from "../../../redux/authReducer";
import { useEffect } from "react";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { resetState } from "../../../redux/jobsReducer";



//Login screen
const EditProviderAccount = ({ navigation }) => {
    //Set the dispatch to use functions from the redux reducers file
    const dispatch = useDispatch();

    const resetAndLogout = () => {
      dispatch(resetState())
      dispatch(logout())
    }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Provider Account Edit</Text>

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
});

export default EditProviderAccount;
