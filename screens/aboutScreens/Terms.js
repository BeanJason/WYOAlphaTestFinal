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

//Information screen about the users
const Terms = ({ navigation }) => {
  return (
    <KeyboardAwareScrollView>
    <ImageBackground
      style={commonStyles.background}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.header1}>Terms and Pricing</Text>
        <Text style={styles.header2}>User Policies and Costs</Text>

        <Text style={styles.header3}>- $12.50 per hour plus a $2.50 service fee.</Text>
        <Text style={styles.header3}>- There is a minimum of 4 hours for booking a WYO and a maximum of 8 hours per day.</Text>
        <Text style={styles.header3}>- This is refundable within 24 hours of booking services. If not canceled within 24 hours of booking then your refund is void and you will not be refunded.</Text>
        <Text style={styles.header3}>- If services cannot be provided, you will be refunded 100% including $2.50 service fee.</Text>
        <Text style={[styles.header2, {marginTop: 30}]}>Restrictions</Text>
        <Text style={styles.header3}>No one under the age of 18 is permitted in the home while the WYO provider is on duty. If someone under the age of 18 is in the home, then the WYO provider will not enter and your refund will be void. Including service fee.</Text>
        <Text style={styles.header3}>If you have a pet then the animal must be put in a separate closed quarters while the WYO provider is at your establishment.</Text>
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
    alignSelf: 'center',
    borderBottomWidth: 1,
    marginTop: 15
  },
  header3: {
    fontFamily: "Montserrat-Regular",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 10,
  },
  logoContainer: {
    alignItems: "center",
  },
});

export default Terms;