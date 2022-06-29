import {
  StyleSheet,
  Text,
  Image,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authReducer";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { resetState } from "../../redux/jobsReducer";



const MyAccount = ({ navigation }) => {
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
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Account</Text>

          <View style={{alignItems: 'center', marginTop: 20}}>
            <TouchableOpacity onPress={() => {navigation.navigate('VerifyAccount')}}>
              <View style={styles.button}>
                <Text style={styles.btnText}>Edit Account</Text>
                <FontAwesome name="cog" size={25} style={{color: 'white', marginLeft: 5}} />
              </View>
            </TouchableOpacity>

          
            <TouchableOpacity onPress={resetAndLogout}>
              <View style={styles.button}>
                <Text style={styles.btnText}>Logout</Text>
                <MaterialIcons name="logout" size={25} style={{color: 'white', marginLeft: 10}} />
              </View>
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

export default MyAccount;
