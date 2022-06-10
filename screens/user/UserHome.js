import React, { useContext } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { commonStyles } from "../../common/styles";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authReducer";
//Icons
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

const UserHome = ({ navigation }) => {
  // Get the global variables & functions via context
  // const myContext = useContext(AppContext);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  return (
    <ImageBackground
      style={[commonStyles.background, { height: 1100 }]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={styles.head}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="account-circle"
              size={55}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="menu" size={60} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <KeyboardAwareScrollView extraScrollHeight={20}>
            <View>
              <Text>Welcome {userInfo.firstName}</Text>
              <Text>Your address is {userInfo.address}</Text>
              <Text>The city you live in is {userInfo.city}</Text>
              <Text>Your zip code is {userInfo.zipCode}</Text>
              <Text>This is where your active jobs will be</Text>
            </View>
            <View style={styles.addBtnContainer}>
              <Text style={styles.header2}>Request new job</Text>
              <TouchableOpacity>
                <Ionicons name="add-circle" size={125} color="orange" />
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  head: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    flex: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  addBtnContainer: {
    // alignItems: "center",
    // justifyContent: 'center',
  },
  header1: {
    fontFamily: "Montserrat-Bold",
    fontSize: 50,
    textAlign: "center",
    marginTop: 10,
  },
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    // marginBottom: -15,
  },
  logoContainer: {
    alignItems: "center",
  },
  buttons: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 70,
    backgroundColor: "black",
    borderRadius: 10,
    marginTop: 50,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBtn: {
    position: "absolute",
    right: 50,
  },
  outerContainer: {
    marginVertical: -160,
  },
  innerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
  },
  logoutButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default UserHome;
