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
import { DataStore} from "aws-amplify";
import { Job, Manager, Provider } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { addOrRemoveJob, resetLocation, updateLocation } from "../../redux/jobsProviderReducer";
import MapView, {Marker, PROVIDER_GOOGLE}  from "react-native-maps"
import Geocoder from "react-native-geocoding";
import { cancelNotificationByID, sendNotificationToManager, sendNotificationToProvider, sendNotificationToUser } from "../../notifications";
import {GOOGLE_API} from "@env"
import * as TaskManager from "expo-task-manager"
import * as Location from "expo-location"
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';
import { Ionicons } from '@expo/vector-icons';

//Login screen
const ServiceView = ({ route, navigation }) => {
  const dispatch = useDispatch();
  let { jobInfo, owner } = route.params;
  const { userInfo } = useSelector((state) => state.auth);
  const { position } = useSelector((state) => state.providerJobs);


  

  const [mainProvider, setMainProvider] = useState('')
  const [isCancelOffense, setIsCancelOffense] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [startCancel, setStartCancel] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [lat, setLat] = useState()
  const [lng, setLng] = useState()
  const [allowCheckIn, setAllowCheckIn] = useState(false)
  const [allowCheckOut, setAllowCheckOut] = useState(false)
  const [isServiceDay, setIsServiceDay] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [canCancel, setCanCancel] = useState(true)

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

    //check in btn?
    let today = new Date()
    if(today.toLocaleDateString() == formatDate.toLocaleDateString()){
      setIsServiceDay(true)
    } 

    //check if 3 days away or less
    formatDate.setHours(formatDate.getHours() - 72)
    if(today > formatDate){
      setIsCancelOffense(true)
    }
  }
  const getProviders = async () => {
    //set main provider if available
    if(jobInfo.mainProvider){
      if(jobInfo.mainProvider == userInfo.userID){
        setMainProvider(`${userInfo.firstName} ${userInfo.lastName}`);
      }
      else{
        await DataStore.query(Provider, jobInfo.mainProvider).then((providerFound) => {
          setMainProvider(`${providerFound.firstName} ${providerFound.lastName}`);
        });
      }
    }
  }



  //get coordinates by address
  const setCoordinatesForMap = async () => {
    console.log('geocoder');
    Geocoder.init(GOOGLE_API, {language: 'en'})
    if(Geocoder.isInit){
      const response = await Geocoder.from(`${jobInfo.address} ${jobInfo.city} ${jobInfo.zipCode}`)
      let newLat = response.results[0].geometry.location.lat
      let newLng = response.results[0].geometry.location.lng
      setLat(newLat)
      setLng(newLng)
      setLoading(false)
    }
  }

  //recheck before checkin/out
  const recheck = async() => {
    let current = await Location.getCurrentPositionAsync({})
    let check = isPointWithinRadius(
      {latitude: current.coords.latitude, longitude: current.coords.longitude},
      {latitude: parseFloat(jobInfo?.latitude), longitude: parseFloat(jobInfo?.longitude)},
      450)       
      return check
  }

  //check in function
  const checkIn = async () => {    
    if(await recheck()){
      const original = await DataStore.query(Job, jobInfo.id)
      let today = new Date()
      await DataStore.save(Job.copyOf(original, updated => {
        updated.checkInTime = today.toString()
        updated.currentStatus = 'IN_SERVICE'
      }))
      createToast('You have checked in. Please do not forget to check out after the job is complete')
      let newJobInfo = Object.create(jobInfo)
      newJobInfo.checkInTime = today.toString()
      console.log('set job');
      dispatch(addOrRemoveJob({ type: "REMOVE_ACTIVE_JOB", jobInfo }));
      dispatch(addOrRemoveJob({ type: "ADD_ACTIVE_JOB", jobInfo: newJobInfo }));
      //send notification to the user
      let messageInfo = {
        title: 'Checked In',
        message:  `Provider ${mainProvider} has just checked into your home to accommodate your job request`,
        data: {jobID: jobInfo.id}
      }
      await sendNotificationToUser(jobInfo.requestOwner, messageInfo)
      setAllowCheckIn(false)
      setAllowCheckOut(true)
    }
    else{
      createToast('Check in failed! Please go to the job site to check in')
    }
  }

  //check out function
  const checkOut = async () => {
    if(await recheck()){
      const original = await DataStore.query(Job, jobInfo.id)
      let today = new Date()
      await DataStore.save(Job.copyOf(original, updated => {
        updated.checkOutTime = today.toString()
        updated.currentStatus = 'COMPLETED'
      }))
      createToast('You have successfully checked out of the job')
      let newJobInfo = Object.create(jobInfo)
      newJobInfo.checkInTime = today.toString()
      dispatch(addOrRemoveJob({ type: "REMOVE_ACTIVE_JOB", jobInfo }));
      dispatch(addOrRemoveJob({ type: "ADD_COMPLETED_JOB", jobInfo: newJobInfo }));
      let managers = await DataStore.query(Manager)
      let messageInfo = {
        title: 'Checked Out',
        message:  `Provider ${mainProvider} has just checked out of their ${jobInfo.title} job request made by the client ${owner.firstName} ${owner.lastName}`,
        data: {jobID: jobInfo.id}
      }
      for(let next of managers){
        sendNotificationToManager(next.expoToken, messageInfo)
      }
      setAllowCheckIn(false)
      setAllowCheckOut(false)
      if(await TaskManager.isTaskRegisteredAsync('BACKGROUND_LOCATION')){
        await Location.stopLocationUpdatesAsync('BACKGROUND_LOCATION')
        console.log('turned off');
      }  
    }
    else{
      setAllowCheckOut(false)
      createToast('Check out failed! Please go to the job site to check out')
    }
  }

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
      if(original.mainProvider == userInfo.userID){
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
            let hour = request.getHours() % 12 || 12;
            let min = (request.getMinutes() < 10 ? "0" : "") + request.getMinutes();
            let amOrPm = "AM";
            if (request.getHours() >= 12) {
              amOrPm = "PM";
            }
            let messageInfo = {
              title: 'New Provider',
              message: `You have been appointed to be the new main provider of the ${original.jobTitle} job on ${request.toLocaleDateString()} at ${hour}:${min}${amOrPm}`,
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
              let providerOriginal = await DataStore.query(Provider, userInfo.userID)
              let count = providerOriginal.offenses
              count += 1
              await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                updated.offenses = count
              }))
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
              let providerOriginal = await DataStore.query(Provider, userInfo.userID)
              let count = providerOriginal.offenses
              count += 1
              await DataStore.save(Provider.copyOf(providerOriginal, updated => {
                updated.offenses = count
              }))
            }
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




  //get current location function (refresh button)
  const getCurrentLocation = async() => {
    setLoadingLocation(true)
    let status = await Location.requestForegroundPermissionsAsync()
    if(status.granted){
      try {
        let current = await Location.getCurrentPositionAsync({})
        if(current){
          let original = await DataStore.query(Provider, userInfo.userID)
          try {
            await DataStore.save(Provider.copyOf(original, (updated) => {
              updated.currentLocation = JSON.stringify({latitude: current.coords.latitude, longitude: current.coords.longitude, dateUpdated: new Date().toString()})
            }))
          } catch (error) {
            console.log(error);
          }
          dispatch(updateLocation(current.coords))
          setLoadingLocation(false)
        }
      } catch (error) {
        console.log(error);
        createToast('You must turn on location to check in')
      }
  }
}

  //check if provider is within range of job site
  const checkProviderRadius = () => {
    //check if the provider is within the area of the job location
    let check = isPointWithinRadius(
      {latitude: position.latitude, longitude: position.longitude},
      {latitude: lat || parseFloat(jobInfo?.latitude), longitude: lng || parseFloat(jobInfo?.longitude)},
      450)
      if(check){
        //within radius
        if(!jobInfo.checkInTime){
          setAllowCheckIn(true)
        }
        else{
          setAllowCheckOut(true)
        }
      } 
      //not within radius
      else{
        if(!jobInfo.checkInTime){
          setAllowCheckIn(false)
        }
        else{
          setAllowCheckOut(false)
        }
      }
  }

  //make sure background task is off before starting it again
  const checkBackgroundTask = async() => {
    if(await TaskManager.isTaskRegisteredAsync('BACKGROUND_LOCATION')){
      await TaskManager.unregisterTaskAsync('BACKGROUND_LOCATION')
    }
  }
  //start service for background location
  const startBackgroundLocation = async() => {
      dispatch(resetLocation())
      console.log('getting permissions');  
      const foregroundPermission = await Location.requestForegroundPermissionsAsync()
      if(!foregroundPermission.granted){
          createToast('You must enable location permissions on the app in order to check in')
      }
      else{
        const backgroundPermission = await Location.requestBackgroundPermissionsAsync()
        if(backgroundPermission.granted){
          const isTaskDefined = TaskManager.isTaskDefined('BACKGROUND_LOCATION')
          if(!isTaskDefined){
            console.log('task not defined, unable to track location');
          } 
          else{
            const hasStarted = await Location.hasStartedLocationUpdatesAsync('BACKGROUND_LOCATION')
            if(hasStarted){
              console.log('already started location tracking');
            }
            else{
              createToast('Please turn on your GPS before attempting to check in')
              console.log('starting track');
              await Location.startLocationUpdatesAsync('BACKGROUND_LOCATION', {
                showsBackgroundLocationIndicator: true,
                accuracy: Location.Accuracy.Highest,
                foregroundService: {
                    notificationTitle: "Location",
                    notificationBody: "Location tracking in background",
                    notificationColor: "#fff",
                },
                deferredUpdatesInterval: 600000,
              })
              createToast('Your location is now being checked')
            }
          }
        }
        else{
          createToast('You must enable background location permissions in order to check in')
        }
      }
     
      
    
  }




  //whenever provider position changes 
  useEffect(() => {
    if(position != null){
      checkProviderRadius()
    }
  },[position])

 
  useEffect(() => {
    dispatch(resetLocation())
    getDateFormat()
    getProviders()
    if(jobInfo.checkInTime){
      setCanCancel(false)
    }
    if(isServiceDay && (!jobInfo.checkInTime || !jobInfo.checkOutTime)){
      checkBackgroundTask()
      getCurrentLocation()
      startBackgroundLocation()
    }
    setCoordinatesForMap()
  },[])

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1100}]}
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
                  <Text style={[styles.noteText, {textAlign: 'center'}]}>Note: This job request is Scheduled for less than 3 days from now. Cancellation of this job will result in an offense on your account</Text> : (
                  <Text style={[styles.noteText, {textAlign: 'center'}]}>Note: Cancellation of this job will not result in an offense on your account because it is scheduled for more than 3 days from today</Text>
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

          {loading ? <Spinner color="#0EFC11" /> : (
            <View>
              <Text style={styles.head}>Job Details</Text>
              <View style={styles.jobContainer}>
              {!canCancel ? <></> : (
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
              )}
                <Text style={styles.title}>{jobInfo.jobTitle}</Text>
                <Text style={styles.generalText}>Request Owner: {owner.firstName + " " + owner.lastName}</Text>
                <Text style={styles.generalText}>Contact: {owner.phoneNumber}</Text>:
                <Text style={styles.generalText}>Duration: {jobInfo.duration} Hours</Text>
                <Text style={styles.generalText}>Address: {jobInfo.address}</Text>
                <Text style={styles.generalText}>City: {jobInfo.city} {jobInfo.zipCode}</Text>
                <Text style={styles.generalText}>Scheduled for {date}</Text>
                <Text style={[styles.generalText, {marginBottom: 30}]}>{time}</Text>
                {jobInfo.jobDescription ? <Text style={[styles.generalText, {marginBottom: 30}]}>Job Description: {jobInfo.jobDescription}</Text> : <></>}
                <Text style={[styles.generalText, {marginBottom: 10}]}>Main Provider: {mainProvider ? mainProvider : 'None'}</Text>
              </View>
              <View style={styles.jobContainer}>
                {/* Buttons */}
                {!isServiceDay ? <></> : (
                  <View>
                    <Text style={[styles.noteText, {textAlign: "center"}]}>Click on the refresh button to check if your current location allows you to check in/out</Text>
                    <View style={{alignItems: 'center', marginBottom: 20}}>
                    {loadingLocation ? <Spinner color='white'/> : (
                      <TouchableOpacity onPress={() => {getCurrentLocation()}}>
                        <Ionicons name="refresh" size={35} />
                      </TouchableOpacity>
                    )}
                    </View>
                  </View>
                )}
                <View style={{alignItems: 'flex-end'}}>
                {allowCheckIn ? (
                  <TouchableOpacity
                  onPress={() => checkIn()}
                  style={styles.button}
                  >
                  <Text style={styles.btnText}>Check In</Text> 
                  </TouchableOpacity>
                ): <></>}
                {allowCheckOut ? (
                  <TouchableOpacity
                  onPress={() => checkOut()}
                  style={styles.button}
                  >
                  <Text style={styles.btnText}>Check Out</Text> 
                  </TouchableOpacity>
                ): <></>}
              </View>

              {/* Map */}
                <Text style={[styles.title, {textAlign: 'center', alignSelf: 'center'}]}>Map</Text>
                <Text style={[styles.generalText, {marginBottom: 10, textAlign: 'center'}]}>Click the marker on the map to open up directions on your maps application</Text>
                <MapView
                  style={{width: '100%', height: 350}}
                  provider={PROVIDER_GOOGLE}
                  followsUserLocation
                  showsUserLocation
                  region={{
                    latitude: lat || parseFloat(jobInfo?.latitude),
                    longitude: lng || parseFloat(jobInfo?.longitude),
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                  }}
                >
                  <Marker
                    title="Destination"
                    coordinate={{
                      
                      latitude: lat || parseFloat(jobInfo?.latitude),
                      longitude: lng || parseFloat(jobInfo?.longitude)
                    }}
                    description={`${jobInfo.address} ${jobInfo.city} ${jobInfo.zipCode}`}
                  />
                </MapView>
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
  },
  noteText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default ServiceView;