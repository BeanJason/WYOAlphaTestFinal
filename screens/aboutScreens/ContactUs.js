import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Image
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { commonStyles } from "../../common/styles";

const ContactUs = ({ navigation }) => {
  return (
    <KeyboardAwareScrollView>
    <ImageBackground
      style={commonStyles.background}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.header1}>Contact Us</Text>
        <View style={styles.logoContainer}>
        <Image
          style={commonStyles.logo}
          source={require("../../assets/Logo.png")}
        />
        </View>
        <Text style={styles.header2}>Have a question or would like to leave a suggestion?</Text>

       
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
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
  },
  header3: {
    fontFamily: "Montserrat-Regular",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
    marginTop: 35,
  },
  logoContainer: {
    alignItems: "center",
  },
});

export default ContactUs;