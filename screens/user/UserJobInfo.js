import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Modal,
  TouchableOpacity
} from "react-native";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useEffect, useState } from "react";
import { API, DataStore, graphqlOperation } from "aws-amplify";
import { refundPayment } from "../../src/graphql/mutations";
import { Provider } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { useDispatch } from "react-redux";
import { addOrRemoveJob } from "../../redux/jobsReducer";
import { decrementZipCodeCount } from "../../common/functions";

//Login screen
const UserJobInfo = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { jobInfo } = route.params;
  const [mainProvider, setMainProvider] = useState('')
  const [backupProviders, setBackupProviders] = useState([])
  const [canCancel, setCanCancel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [startCancel, setStartCancel] = useState(false)
  const [date, setDate] = useState()
  const [time, setTime] = useState()

  const getDateFormat = () => {
    let formatDate = new Date(jobInfo.requestDateTime)
    let hours = formatDate.getHours() % 12 || 12;
    let min = (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
    let durationHour = (formatDate.getHours() + jobInfo.duration) % 12 || 12
    let amOrPm = "AM";
    let durationAmOrPm = "AM"
    if (formatDate.getHours() >= 12) {
      amOrPm = "PM";
    }
    if(formatDate.getHours() + jobInfo.duration >= 12){
      durationAmOrPm = "PM"
    }
    setDate(formatDate.toLocaleDateString())
    setTime(`from ${hours}:${min}${amOrPm}-${durationHour}:${min}${durationAmOrPm}`)
  }

  const getBackupProviders = () => {
    let text = ''
    for(let next of backupProviders){
      text += next + '\n'
    }
    return text
  }

  const getProviders = async () => {
    //set main provider if available
    if(jobInfo.mainProvider){
      await DataStore.query(Provider, provider => provider.id("eq", jobInfo.mainProvider)).then((providerFound) => {
        setMainProvider(`${providerFound[0].firstName} ${providerFound[0].lastName}`);
      });
    }
    //set backup providers if available
    if(jobInfo.backupProviders && jobInfo.backupProviders.length != 0){
      let listOfBackups = []
      for(let next of jobInfo.backupProviders){
        await DataStore.query(Provider, provider => provider.id("eq", next)).then((providerFound) => {
          listOfBackups.push(`${providerFound[0].firstName} ${providerFound[0].lastName}`)
        });
      }
      setBackupProviders(listOfBackups)
    }
  }

  const cancelJob = async () => {
    setStartCancel(true)
    //REFUND
    try {
      let refundStatus = await API.graphql(graphqlOperation(refundPayment, {
          isCancel: true,
          jobID: jobInfo.id
        })
        )
        if(refundStatus){
          await decrementZipCodeCount({code: {zipCode: jobInfo.zipCode}})
          dispatch(addOrRemoveJob({type: 'REMOVE_ACTIVE_JOB', jobInfo}))
          setTimeout(() => {
            setStartCancel(false)
            createToast('Your job request has been cancelled')
            navigation.reset({ routes: [{name: 'UserHome'}]})
            navigation.navigate('UserHome', {name: 'UserHome'})
          }, 5000)
        }
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {
    getDateFormat()
    getProviders()
    let date = new Date(jobInfo.createdAt)
    date.setHours(date.getHours() + 24)
    let today = new Date()
    if(date.toLocaleDateString() > today.toLocaleDateString() || (date.toLocaleDateString() == today.toLocaleDateString() && date.toLocaleTimeString() > today.toLocaleTimeString())){
      setCanCancel(true)
    }
    setLoading(false)
  },[])

  if(loading){
    return (
      <Spinner color={'#0EFC11'}/>
    )
  }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../assets/wyo_background.png")}>
        <SafeAreaView style={commonStyles.safeContainer}>
          {/* MODAL */}
          <Modal
            visible={showModal}
            transparent
            animationType='slide'
            hardwareAccelerated
          >
            <View style={styles.centeredView}>
            {canCancel ? (
              <View style={styles.warningModal}>
                <Text style={styles.modalTitle}>Warning</Text>
                <Text style={styles.modalText}>After cancellation of this job you will be 
                refunded through your original payment method. Are you sure you want to cancel this job?
                </Text>
                {startCancel ?  <Spinner color={'black'}/> : (
                  //Buttons
                  <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 40}}>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={styles.button}
                  >
                  <Text style={styles.btnText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => cancelJob()}
                    style={styles.button}
                  >
                  <Text style={styles.btnText}>Yes</Text>
                  </TouchableOpacity>
                  </View>
                )}
              </View>
            ):
              <View style={styles.warningModal}>
                <Text style={styles.modalTitle}>Cancellation</Text>
                <Text style={styles.modalText}>The cancellation of this job cannot be processed due to company policy.
                A job is eligible for cancellation only if 24 hours have not passed since the request was made.
                </Text>
                <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={[styles.button, {alignSelf: 'center', marginTop: 10}]}
                  >
                  <Text style={styles.btnText}>Back</Text>
                  </TouchableOpacity>
              </View>
            }
            </View>
          </Modal>


          <Text style={styles.head}>Job Details</Text>
          <View style={styles.jobContainer}>
            <View style={{alignItems: 'flex-end', marginBottom: -10}}>
              {jobInfo.currentStatus != 'COMPLETED' ? 
                <TouchableOpacity
                  onPress={() => setShowModal(true)}
                  style={styles.button}
                  >
                  <Text style={styles.btnText}>Cancel Job</Text> 
                </TouchableOpacity>
              : <></>
              }
            </View>
            <Text style={styles.title}>{jobInfo.jobTitle}</Text>
            <Text style={styles.generalText}>Duration: {jobInfo.duration}</Text>
            <Text style={styles.generalText}>Address: {jobInfo.address}</Text>
            <Text style={styles.generalText}>City: {jobInfo.city} {jobInfo.zipCode}</Text>
            <Text style={styles.generalText}>Scheduled for {date}</Text>
            <Text style={[styles.generalText, {marginBottom: 30}]}>{time}</Text>
            {jobInfo.jobDescription ? <Text style={[styles.generalText, {marginBottom: 30}]}>Job Description: {jobInfo.jobDescription}</Text> : <></>}
            <Text style={[styles.generalText, {marginBottom: 10}]}>Main Provider: {mainProvider ? mainProvider : 'None'}</Text>
            {backupProviders.length == 0 ? <></> : (
              <View>
                <Text style={[styles.generalText, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Backup Providers</Text>
                <Text style={styles.generalText}>{getBackupProviders()}</Text>
              </View>
            )}
          </View>

        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  head: {
    fontFamily: "Montserrat-Bold",
    fontSize: 30,
    padding: 5,
    textAlign: "center",
    marginBottom: 10
  },
  headerText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
    textAlign: "center",
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
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginBottom: 10
  },
  generalText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    fontWeight: '800'
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090'
  },
  warningModal: {
    width: 350,
    height: 300,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 17,
    padding: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    marginBottom: 5,
    alignSelf: 'center',
    textAlign: 'center'
  }
});

export default UserJobInfo;
