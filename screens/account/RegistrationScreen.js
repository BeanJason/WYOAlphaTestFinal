import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//Main registration screen to choose to sign up as a provider or user
const RegistrationScreen = ({ navigation }) => {
  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1000}]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          {/* LOGO */}
            <Text style={styles.header1}>Sign Up</Text>
            <Text style={styles.header2}>
              Choose to sign up as either a user or provider
            </Text>
            <View>
              <View style={styles.logoContainer}>
                <Image
                  style={commonStyles.logo}
                  source={require("../../assets/Logo.png")}
                />
                </View>
            </View>

            <View style={styles.outerContainer}>
              {/* User Button */}
              <View style={styles.innerContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("UserRegistration", {
                      name: "UserRegistration",
                    })
                  }
                >
                  <View style={styles.buttons}>
                    <Text style={styles.btnText}>User</Text>
                  </View>
                </TouchableOpacity>

                {/* Info btn */}
                <View style={styles.infoBtn}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AboutUsers", {
                        name: "AboutUsers",
                      })
                    }
                  >
                    <FontAwesome name="info-circle" size={30} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Provider Button */}
              <View style={styles.innerContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProviderRegistration", {
                      name: "ProviderRegistration",
                    })
                  }
                >
                  <View style={styles.buttons}>
                    <Text style={styles.btnText}>Provider</Text>
                  </View>
                </TouchableOpacity>

                {/* Info btn */}
                <View style={styles.infoBtn}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AboutProviders", {
                        name: "AboutProviders",
                      })
                    }
                  >
                    <FontAwesome name="info-circle" size={30} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          
        </SafeAreaView>
      </ImageBackground>
      </KeyboardAwareScrollView>
  );
};

export default RegistrationScreen;

const styles = StyleSheet.create({
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
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 30,
  },
  infoBtn: {
    position: "absolute",
    right: 50,
  },
  outerContainer: {
    marginTop: 10
  },
  innerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
  },
});