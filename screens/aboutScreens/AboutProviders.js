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

//Information screen about providers
const AboutProviders = ({ navigation }) => {
  return (
    <KeyboardAwareScrollView>
    <ImageBackground
      style={[commonStyles.background, {height: 1000}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.header1}>Provider Information</Text>
        <View style={styles.logoContainer}>
        <Image
          style={commonStyles.logo}
          source={require("../../assets/Logo.png")}
        />
        </View>
        <Text style={styles.header2}>About the Provider</Text>

        <Text style={styles.header3}>WYO providers are trusted individuals that live in your community who will come to your home or place of business to wait for service providers when you can't be there because of work, or other obligations. Many of our WYO's are retired individuals who have lived in your neighborhood for many years and are highly involved and trusted by your community members. All WYO providers have cleared a background check.</Text>

        <Text style={styles.header4}>What a While You're Out Services Provider is not:</Text>
        <Text style={styles.header5}>WYO does not offer childcare or pet sitting, if you have a pet then the animal must be put in a separate closed quarters while the WYO provider is at your establishment.</Text>

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
    alignSelf: 'center',
    borderBottomWidth: 1
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
    marginTop: 35,
    marginHorizontal: 10,
    alignSelf: 'center',
    borderBottomWidth: 1
  },
  header5: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: -15,
    marginTop: 35,
    marginHorizontal: 10,
  },
  logoContainer: {
    alignItems: "center",
  },
});

    export default AboutProviders;