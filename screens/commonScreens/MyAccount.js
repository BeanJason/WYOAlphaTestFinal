import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authReducer";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { resetState } from "../../redux/jobsReducer";



const MyAccount = ({ navigation }) => {
    //Set the dispatch to use functions from the redux reducers file
    const dispatch = useDispatch();
    const {authUser, userInfo} = useSelector((state) => state.auth)

    const resetAndLogout = async() => {
      dispatch(resetState())
      dispatch(logout({type: authUser['custom:type'], id: userInfo.id}))
    }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header1}>Your Account</Text>
          <View style={{marginTop: 30}}>
              <Text style={[styles.subtitle, {marginBottom: 10} ]}>You are currently logged in as </Text>
              <Text style={[styles.subtitle, {marginLeft: 10, marginTop: 5, alignSelf: 'center', borderBottomWidth: 1}]}>{userInfo.firstName} {userInfo.lastName}</Text>
            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'space-evenly'}}>
              <TouchableOpacity onPress={() => {navigation.navigate('VerifyAccount')}}>
                <View style={styles.button}>
                  <Text style={styles.btnText}>Edit Account</Text>
                  <FontAwesome name="cog" size={25} style={{color: 'white', marginLeft: 5}} />
                </View>
              </TouchableOpacity>

            
              <TouchableOpacity onPress={() => resetAndLogout()}>
                <View style={styles.button}>
                  <Text style={styles.btnText}>Logout</Text>
                  <MaterialIcons name="logout" size={25} style={{color: 'white', marginLeft: 10}} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.container, {marginTop: 20, flexDirection: 'row' , justifyContent: 'space-between'}]}>
                  <View>
                  <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start', padding: 5, marginBottom: 10}]}>Helpful Links</Text>
                    <TouchableOpacity style={{margin: 5}} onPress={() => {navigation.navigate('AboutUs')}}>
                      <Text style={[styles.generalText, {color: 'blue'}]}>Information about the company</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{margin: 5}} onPress={() => {navigation.navigate('ContactUs')}}>
                      <Text style={[styles.generalText, {color: 'blue'}]}>Contact Us</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{marginTop: 20}}>
                    <TouchableOpacity style={{margin: 5}} onPress={() => {navigation.navigate('AboutUsers')}}>
                      <Text style={[styles.generalText, {color: 'blue'}]}>About Users</Text>
                    </TouchableOpacity>
                    {authUser['custom:type'] == 'User' || authUser['custom:type']  == 'Manager' ? (
                      <TouchableOpacity style={{margin: 5}} onPress={() => {navigation.navigate('Terms')}}>
                        <Text style={[styles.generalText, {color: 'blue'}]}>User Policies</Text>
                      </TouchableOpacity>
                    ): <></>}
                    <TouchableOpacity style={{margin: 5}} onPress={() => {navigation.navigate('AboutProviders')}}>
                      <Text style={[styles.generalText, {color: 'blue'}]}>About Providers</Text>
                    </TouchableOpacity>
                  </View>
            </View>
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
    fontSize: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 160,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 20,
    flexDirection: 'row'
  },
  generalText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    fontWeight: '800'
  },
  subtitle:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  container: {
    borderColor: "rgba(0,221,255,0.9)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.9)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
  },
});

export default MyAccount;
