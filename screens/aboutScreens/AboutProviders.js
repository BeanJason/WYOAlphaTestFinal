import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView
} from "react-native";
import { commonStyles } from "../../common/styles";

//Information screen about providers
const AboutProviders = ({ navigation }) => {
  return (
    <ImageBackground
      style={commonStyles.background}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.header1}>Provider Information</Text>
        <Text style={styles.header2}>About the Provider</Text>

        <Text style={styles.header3}></Text>
      </SafeAreaView>
    </ImageBackground>
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
});

    export default AboutProviders;