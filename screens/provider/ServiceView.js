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
import { Job, Provider, User } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { addOrRemoveJob, reinitialize } from "../../redux/jobsProviderReducer";

//Login screen
const ServiceView = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { jobInfo, owner } = route.params;
  const { userInfo } = useSelector((state) => state.auth);

  const [mainProvider, setMainProvider] = useState('')
  const [backupProviders, setBackupProviders] = useState([])
  const [canCancel, setCanCancel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [startCancel, setStartCancel] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

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
      if(jobInfo.mainProvider == userInfo.userID){
        setMainProvider(`${userInfo.firstName} ${userInfo.lastName}`);
      }
      else{
        await DataStore.query(Provider, provider => provider.id("eq", jobInfo.mainProvider)).then((providerFound) => {
          setMainProvider(`${providerFound[0].firstName} ${providerFound[0].lastName}`);
        });
      }
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

  const checkIn = async () => {
    console.log('check in');
  }

  const checkOut = async () => {
    console.log('check out');
  }

  const cancelJob = async () => {
    setStartCancel(true)
    //cancel services
    let original
    let success = false;
    try {
      original = await DataStore.query(Job, jobInfo.id)
    } catch (error) {
      console.log(error);
    }

    if(original){
      //if provider was the main get the next backup and set as main if available
      if(original.mainProvider == userInfo.userID){
        if(original.backupProviders){
          let newMain = original.backupProviders[0]
          try {
            await DataStore.save(Job.copyOf(original, updated => {
                updated.mainProvider = newMain
                updated.backupProviders = updated.backupProviders.filter(id => id != newMain)
            }))
            success = true
          } catch (error) {
              console.log(error);
          }
        }
        //if no backups remove main provider only
        else{
          try {
            await DataStore.save(Job.copyOf(original, updated => {
                updated.mainProvider = null
            }))
            success = true
          } catch (error) {
              console.log(error);
          }
        }
      }
      //If provider was a backup
      else if(original.backupProviders.includes(userInfo.userID)){
        try {
          await DataStore.save(Job.copyOf(original, updated => {
            updated.backupProviders = updated.backupProviders.filter(id => id != userInfo.userID)
          }))
          success = true
        } catch (error) {
            console.log(error);
        }
      }

      dispatch(addOrRemoveJob({type: 'REMOVE_ACTIVE_JOB', jobInfo}))
      createToast('Your job service has been cancelled')
      setTimeout(() => {
        setStartCancel(false)
        navigation.navigate('ProviderHome', {name: 'ProviderHome'})
      }, 5000)
    }
    
  }

  
  
  useEffect(() => {
    getDateFormat()
    getProviders()
    setCanCancel(true)
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
                <Text style={styles.modalText}>Are you sure you want to cancel service for this job?
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
                <Text style={styles.modalText}>You are no longer able to cancel services for this job at this time.
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
            <Text style={styles.generalText}>Request Owner: {owner.firstName + " " + owner.lastName}</Text>
            {owner.contactMethod == 'phone' ? 
            <Text style={styles.generalText}>Contact: {owner.phoneNumber}</Text>:
            <Text style={styles.generalText}>Contact: {owner.email}</Text>
            }
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
          <View style={styles.jobContainer}>
            <Text style={[styles.title, {textAlign: 'center', alignSelf: 'center'}]}>Map</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            {/* Buttons */}
            <TouchableOpacity
              onPress={() => checkIn()}
              style={styles.button}
              >
              <Text style={styles.btnText}>Check In</Text> 
            </TouchableOpacity>
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

export default ServiceView;
