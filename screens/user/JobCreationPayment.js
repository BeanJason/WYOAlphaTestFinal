import {
    StyleSheet,
    Text,
    Image,
    View,
    ImageBackground,
    SafeAreaView,
  } from "react-native";
  import { TouchableOpacity } from "react-native";
  import UserInput from "../../common/components/UserInput";
  import Spinner from "../../common/components/Spinner";
  import { commonStyles } from "../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { login, resetState } from "../../redux/authReducer";
  import { useEffect, useState } from "react";
  import { DataStore, API, graphqlOperation } from "aws-amplify";
  import { Job } from "../../src/models";
  import {useStripe} from "@stripe/stripe-react-native"
  import { createPaymentIntent } from "../../src/graphql/mutations"
  
  //Login screen
  const JobCreationPayment = ({route, navigation }) => {
    const {data, userInfo} = route.params
    const { authUser } = useSelector((state) => state.auth);
    const [clientSecret, setclientSecret] = useState('')
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const [loading, setLoading] = useState(false)

    const submitJob = async () => {
      
    }

    //setup the payment screen
    const fetchPaymentIntent = async () => {
      if(data.duration){
        const response = await API.graphql(
          graphqlOperation(createPaymentIntent, {
            duration: data.duration,
            userID: userInfo.userID,
            email: authUser.email
          })
        )
        setclientSecret(response.data.createPaymentIntent.clientSecret)
      }
    }

    //happens on page load
    useEffect(() => {
      fetchPaymentIntent();
    },[])

    //initialize screen when client secret is available
    useEffect(() => {
      if(clientSecret){
        initializePaymentScreen()
      }
    },[clientSecret])

    //initialize screen
    const initializePaymentScreen = async () => {
      console.log(clientSecret);
      if(!clientSecret){
        return;
      }
      const initPay  = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'WYOServices'
      })
      console.log(initPay);
      if(initPay.error){
        setLoading(true)
      }
    }

    //opens the checkout screen
    const openPaymentScreen = async () => {
      if(!clientSecret){
        return;
      }
      const { error } = await presentPaymentSheet();
      if (error) {
        console.log(`Error code: ${error.code}`, error.message);
      } else {
        submitJob();
        console.log('Success', 'Your order is confirmed!');
      }
    }

  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={commonStyles.background}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text>This is the job creation page part 2</Text>

          <View style={{alignItems: 'center', marginTop: 20}}>
           <TouchableOpacity 
              onPress={() => openPaymentScreen()}
              disabled={loading}
            >
              <View style={styles.button}>
                <Text style={styles.btnText}>Checkout</Text>
              </View>
            </TouchableOpacity>
          </View>



          </SafeAreaView>
        </ImageBackground>
      </KeyboardAwareScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    
  });
  
  export default JobCreationPayment;
  