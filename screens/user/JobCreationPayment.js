import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    SafeAreaView,
    Dimensions,
    TouchableOpacity
  } from "react-native";
  import Spinner from "../../common/components/Spinner";
  import { commonStyles } from "../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useDispatch, useSelector } from "react-redux";
  import { useEffect, useState } from "react";
  import { DataStore, API, graphqlOperation } from "aws-amplify";
  import { Job } from "../../src/models";
  import {initPaymentSheet, presentPaymentSheet} from "@stripe/stripe-react-native"
  import { createToast } from "../../common/components/Toast";
  import { createPaymentIntent } from "../../src/graphql/mutations";
  import { addOrRemoveJob, storeNewJobID } from "../../redux/jobsReducer";
  import * as queries from "../../src/graphql/queries"
  
  //Login screen
  const JobCreationPayment = ({route, navigation }) => {

    //prevent going back
    navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
    })

    const {data, userInfo} = route.params
    const dispatch = useDispatch()
    const { authUser } = useSelector((state) => state.auth);
    const { newJobID } = useSelector((state) => state.jobs);
    const [clientSecret, setclientSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('Queuing your payment, please wait...')
    let newJob, paidJob, timer
    let counter = 0

    //post payment
    const submitJob = async () => {
      setPaymentStatus('Submitting your payment...');
      setTimeout(() => {
        setPaymentStatus('Verifying payment')
        timer = setInterval(verifyPaid, 5000)
      }, 2000)
    }

    //verify payment for a job
    const verifyPaid = async () => {
      console.log('observing');
      counter++;
      if(counter >= 4){
        setPaymentStatus("Payment verification failed!")
        dispatch(storeNewJobID({jobID: ""}))
        clearInterval(timer)
      }
      else{
        if(newJobID != ""){
          paidJob = await API.graphql(graphqlOperation(queries.getJob, {id: newJobID}));
          if(paidJob.data.getJob.paymentID != "" && paidJob.data.getJob.paymentID != null){
            clearInterval(timer)
            dispatch(addOrRemoveJob({type: 'ADD_ACTIVE_JOB', jobInfo: paidJob.data.getJob}))
            dispatch(storeNewJobID({jobID: ""}))
            setTimeout(() => {
              route.params.jobInfo = paidJob.data.getJob
              setPaymentStatus('Payment was successful!')
              navigation.navigate("Home")
            }, 2000)
          }
        }
      }
    }

    //setup the payment screen
    const fetchPaymentIntent = async () => {
      let price = 2000;
      switch (data.duration) {
        case 4:
          price = 2000;
          break;
        case 5:
          price = 3000;
          break;
        case 6:
          price = 4000;
          break;
        case 7:
          price = 5000;
          break;
        case 8:
          price = 6000;
          break;
      }

      try {
         newJob = await DataStore.save(
          new Job({
          "jobTitle": data.jobTitle,
          "jobDescription": data.jobDescription,
          "address": data.address,
          "city": data.city,
          "zipCode": data.zipCode,
          "duration": data.duration,
          "requestDateTime": data.requestDateTime,
          "backupProviders": [],
          "currentStatus": "REQUESTED",
          "requestOwner": userInfo.userID,
          "price": price
        }));
        try {
          const response = await API.graphql(
            graphqlOperation(createPaymentIntent, {
              amount: price,
              email: authUser.email,
              jobID: newJob.id
            })
          )
          setclientSecret(response.data.createPaymentIntent.clientSecret)
          dispatch(storeNewJobID({jobID:  response.data.createPaymentIntent.id}))
          route.params.jobInfo = newJob
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log('error saving job: ' + error);
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
      if(!clientSecret){
        return;
      }
      const initPay  = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'WYOServices'
      })
      if(initPay.error){
        setLoading(true)
      }
    }

    //opens the checkout screen
    const openPaymentScreen = async () => {
      if(!clientSecret){
        return;
      }
      setLoading(true)
      const payment  = await presentPaymentSheet();
      if (payment.error) {
        console.log(`Error code: ${payment.error.code}`, payment.error.message);
        setLoading(false)
        createToast('Error, ' + payment.error.message)
      } else {
        setPaymentStatus('One moment while we verify your payment.')
        submitJob();
      }
    }

    const cancelJob = async () => {
      dispatch(storeNewJobID(""))
      navigation.navigate('Home')
    }

    //get date
    const getDateFormat = () => {
      let formatDate = new Date(data.requestDateTime)
      let hour = formatDate.getHours() % 12 || 12;
      let min = (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
      let amOrPm = "AM";
      if (formatDate.getHours() >= 12) {
        amOrPm = "PM";
      }
      let date = formatDate.toLocaleDateString() +" at " + hour + ":" + min + amOrPm
      return date
    }
  
    return (
      <KeyboardAwareScrollView>
        <ImageBackground
          style={[commonStyles.background, {flex: 1}]}
          source={require("../../assets/wyo_background.png")}
        >
          <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.headerText}>Make a payment to complete your job request</Text>

          <View style={{alignItems: 'center', marginTop: 20, flex: 1}}>
            <Text style={[styles.generalText, {textAlign: 'center'}]}>Please verify all the information for your job request below</Text>
            <View style={styles.jobContainer}>
              <Text style={styles.generalText}>Job Title: {data.jobTitle}</Text>
              <Text style={styles.generalText}>Address: {data.address} {data.city} {data.zipCode}</Text>
              <Text style={styles.generalText}>Job Duration: {data.duration}</Text>
              <Text style={styles.generalText}>Job Date & Time: {getDateFormat()}</Text>
              {data.jobDescription ? <Text style={styles.generalText}>Job Description: {data.jobDescription}</Text> : <></> }
            </View>
          {loading ? (
            <View style={{flex: 1}}>
              <Text style={styles.generalText}>{paymentStatus}</Text>
              <Spinner color={'black'}/> 
            </View>
            ): (
             <View>
              <View style={{flexDirection:'row', justifyContent: 'space-evenly'}}>
                <TouchableOpacity 
                onPress={() => cancelJob()}
                >
                <View style={styles.button}>
                  <Text style={styles.btnText}>Cancel</Text>
                </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => openPaymentScreen()}
                >
                  <View style={styles.button}>
                    <Text style={styles.btnText}>Checkout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          </View>
          </SafeAreaView>
        </ImageBackground>
      </KeyboardAwareScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    headerText: {
      fontFamily: "Montserrat-Bold",
      fontSize: 25,
      padding: 5,
      marginBottom: 10,
      marginTop: 15,
      borderBottomWidth: 2,
      alignSelf: 'center',
      textAlign: 'center'
    },
    generalText: {
      fontFamily: "Montserrat-Regular",
      fontSize: 20,
      fontWeight: "800",
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
      width: 120,
      height: 40,
      backgroundColor: "black",
      borderRadius: 10,
      marginVertical: 10,
      marginLeft: 25,
      marginRight: 25,
    },
    btnText: {
      color: "white",
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
    },
    jobContainer: {
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
  
  export default JobCreationPayment;
  