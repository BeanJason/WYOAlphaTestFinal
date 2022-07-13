import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView
} from "react-native";
import { commonStyles } from "../../common/styles";

//Information screen about the company
const AboutUs = ({ navigation }) => {
  return (
    <ImageBackground
      style={commonStyles.background}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.header1}>Company Information</Text>
        <Text style={styles.header2}>About the Company</Text>

        <Text style={styles.header3}>Why oh is a service based company that offers members of your community the chance to earn income helping you While You’re Out.
schedule a trusted WYO who lives in your community today.</Text>
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
  header3: {
    fontFamily: "Montserrat-Regular",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
    marginTop: 35,
  },
});

export default AboutUs;