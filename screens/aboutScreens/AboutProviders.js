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

        <Text style={styles.header3}>WYO providers are trusted individuals that live in your community who will come to your home or place of business to wait for service providers when you can’t be there because of work, or other obligations. Many of our WYO’s are retired individuals who have lived in your neighborhood for many years and are highly involved and trusted by your community members. All WYO providers have cleared a background check.</Text>

        <Text style={styles.header4}>What  a While You’re Out Services Provider  is not:</Text>
        <Text style={styles.header4}>WYO does not offer childcare or pet sitting, if you have a pet then the animal must be put in a separate closed quarters while the WYO provider is at your establishment.</Text>

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
    marginHorizontal: 10,
  },
  header4: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
    marginTop: 35,
    marginHorizontal: 10,
  },
});

    export default AboutProviders;