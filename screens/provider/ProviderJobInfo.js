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
import { DataStore } from "aws-amplify";
import { Job, Provider, User } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { addOrRemoveJob } from "../../redux/jobsProviderReducer";
import { formatTime, sendProviderOffenseEmail } from "../../common/functions";

//Login screen
const ProviderJobInfo = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { jobInfo } = route.params;
  const { userInfo } = useSelector((state) => state.auth);
  const [mainProvider, setMainProvider] = useState('')
  const [backupProviders, setBackupProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ownerName, setOwnerName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [startCancel, setStartCancel] = useState(false)
  const [isCancelOffense, setIsCancelOffense] = useState(false)


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

    //check if 3 days away or less
    let today = new Date()
    formatDate.setHours(formatDate.getHours() - 72)
    if(today > formatDate){
      setIsCancelOffense(true)
    }
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
      if(jobInfo.mainProvider == userInfo.id){
        setMainProvider(`${userInfo.firstName} ${userInfo.lastName}`);
      }
      else{
        await DataStore.query(Provider, jobInfo.mainProvider).then((providerFound) => {
          setMainProvider(`${providerFound.firstName} ${providerFound.lastName}`);
        });
      }
    }
    //set backup providers if available
    if(jobInfo.backupProviders && jobInfo.backupProviders.length != 0){
      let listOfBackups = []
      for(let next of jobInfo.backupProviders){
        await DataStore.query(Provider, next).then((providerFound) => {
          listOfBackups.push(`${providerFound.firstName} ${providerFound.lastName}`)
        });
      }
      setBackupProviders(listOfBackups)
    }
  }

  const getRequestOwnerName = async () => {
    await DataStore.query(User, jobInfo.requestOwner).then((user) => setOwnerName(user.firstName + " " + user.lastName))
      .catch((error) => console.log(error))
  }
  
  useEffect(() => {
    getDateFormat()
    getProviders()
    getRequestOwnerName()
    setLoading(false)
  },[])

  

  //cancel job function
  const cancelJob = async () => {
    setStartCancel(true)
    //cancel services
    let original
    try {
      original = await DataStore.query(Job, jobInfo.id)
    } catch (error) {
      console.log(error);
    }

    if(original){
      //if provider was the main get the next backup and set as main if available
      if(original.mainProvider == userInfo.id){
        //if backups are available
        if(original.backupProviders.length != 0){
          let newMain = original.backupProviders[0]
          //cancel notifications
          if(original.providerNotificationID){
            await cancelNotificationByID(original.providerNotificationID[0])
            await cancelNotificationByID(original.providerNotificationID[1])
          }
          try {
            await DataStore.save(Job.copyOf(original, updated => {
                updated.mainProvider = newMain
                updated.backupProviders = updated.backupProviders.filter(id => id != newMain)
                updated.providerNotificationID = []
            }))
            //send notification to new main provider
            let request = new Date(original.requestDateTime);
            let messageInfo = {
              title: 'New Provider',
              message: `You have been appointed to be the new main provider of the ${original.jobTitle} job on ${request.toLocaleDateString()} at ${formatTime(request)}`,
              data: {jobID: original.id}
            }
            await sendNotificationToProvider(newMain, messageInfo)
            //send notification to user about new provider
            let messageInfo2 = {
              title: 'Provider Switch',
              message: `${userInfo.firstName} is now the main provider for your job request`
            }
            await sendNotificationToUser(original.requestOwner, messageInfo2)
            if(isCancelOffense){
              let providerOriginal = await DataStore.query(Provider, userInfo.id)
              let count = providerOriginal.offenses
              count += 1
              if(count >= 2){
                await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                  updated.isBan = true;
                  updated.offenses = count
                }))
              }
              else{
                await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                  updated.offenses = count
                }))
              }
              createToast('You have received an offense on your account')
            }
          } catch (error) {
              console.log(error);
          }
        }
        //if no backups remove main provider only
        else{
          console.log('No backups available');
          //cancel notifications
          if(original.providerNotificationID){
            await cancelNotificationByID(original.providerNotificationID[0])
            await cancelNotificationByID(original.providerNotificationID[1])
          }
          try {
            await DataStore.save(Job.copyOf(original, updated => {
                updated.currentStatus = 'REQUESTED'
                updated.mainProvider = null
                updated.providerNotificationID = []
            }))
            //send notification to user about provider cancellation
            let messageInfo = {
              title: 'Job Cancelled',
              message: 'The main provider has cancelled your job request'
            }
            await sendNotificationToUser(original.requestOwner, messageInfo)
            if(isCancelOffense){
              let providerOriginal = await DataStore.query(Provider, userInfo.id)
              let count = providerOriginal.offenses
              count += 1
              if(count >= 2){
                await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                  updated.isBan = true;
                  updated.offenses = count
                }))
                sendProviderOffenseEmail(userInfo.firstName, userInfo.email, true)
              }
              else{
                await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                  updated.offenses = count
                }))
                sendProviderOffenseEmail(userInfo.firstName, userInfo.email, false)
              }
              createToast('You have received an offense on your account')
            }
          } catch (error) {
              console.log(error);
          }
        }
      }
      //If provider was a backup
      else if(original.backupProviders.includes(userInfo.id)){
        try {
          await DataStore.save(Job.copyOf(original, updated => {
            updated.backupProviders = updated.backupProviders.filter(id => id != userInfo.id)
          }))
        } catch (error) {
            console.log(error);
        }
      }

      dispatch(addOrRemoveJob({type: 'REMOVE_ACTIVE_JOB', jobInfo}))
      setTimeout(() => {
        setStartCancel(false)
        createToast('Your job service has been cancelled')
        navigation.navigate('ProviderHome', {name: 'ProviderHome'})
      }, 5000)
    }
    
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
              <View style={styles.warningModal}>
                <Text style={styles.modalTitle}>Warning</Text>
                <Text style={styles.modalText}>Are you sure you want to cancel service for this job?
                </Text>
                {isCancelOffense ? 
                  <Text style={{textAlign: 'center'}}>
                      <Text style={[styles.noteText, ]}>Note: This job request is Scheduled for less than 3 days from now. Cancellation of this job </Text>
                      <Text style={[styles.noteText, {fontFamily: 'Montserrat-Bold'}]}>will</Text>
                      <Text style={[styles.noteText, ]}> result in an offense on your account</Text>
                    </Text>
                    : (
                    <Text style={{textAlign: 'center'}}>
                      <Text style={[styles.noteText, ]}>Note: Cancellation of this job will </Text>
                      <Text style={[styles.noteText, {fontFamily: 'Montserrat-Bold'}]}>not</Text>
                      <Text style={[styles.noteText, ]}> result in an offense on your account because it is scheduled for more than 3 days from today </Text>
                    </Text>
                )}
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
            </View>
          </Modal>


          {loading ? <Spinner/> : (
            <View>
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
                <Text style={styles.generalText}>Request Owner: {ownerName}</Text>
                <Text style={styles.generalText}>Duration: {jobInfo.duration} Hours</Text>
                <Text style={styles.generalText}>City: {jobInfo.city} {jobInfo.zipCode}</Text>
                <Text style={styles.generalText}>Scheduled for {date}</Text>
                <Text style={[styles.generalText, {marginBottom: 30}]}>{time}</Text>
                {jobInfo.jobDescription ? 
                <View>
                  <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Job Description</Text> 
                  <Text style={[styles.generalText, {marginBottom: 15}]}>{jobInfo.jobDescription}</Text>
                </View>
                : <></>}
                <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Main Provider</Text>
                <Text style={[styles.generalText, {marginBottom: 10}]}>{mainProvider ? mainProvider : 'None'}</Text>
                {backupProviders.length == 0 ? <></> : (
                  <View>
                    <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Backup Providers</Text>
                    <Text style={styles.generalText}>{getBackupProviders()}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

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
    fontSize: 18,
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
  subtitle:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
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
  },
  noteText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default ProviderJobInfo;
