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
import MapView, {Marker}  from "react-native-maps"
import Geocoder from "react-native-geocoding";
import { cancelNotificationByID, sendNotificationToManager, sendNotificationToProvider, sendNotificationToUser } from "../../notifications";
import {GOOGLE_API} from "@env"
import { getLocationPermission } from "../../common/functions";
import * as TaskManager from "expo-task-manager"
import * as Location from "expo-location"
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';
let foregroundSubscription

//Login screen
const ServiceView = ({ route, navigation }) => {
  const dispatch = useDispatch();
  let { jobInfo, owner } = route.params;
  const { userInfo } = useSelector((state) => state.auth);
  const { position } = useSelector((state) => state.providerJobs);

  TaskManager.defineTask('BACKGROUND_LOCATION', async ({data, error}) => {
    console.log('task is setup');
      if (error) {
          console.error(error);
          return;
        }
        if(data){
          const {locations} = data
          const location = locations[0]
          if(location){
              // console.log(location);
              console.log('location change');
              // let original = await DataStore.query(Provider, userInfo.userID)
              // try {
              //   await DataStore.save(Provider.copyOf(original, (updated) => {
              //     updated.currentLocation = JSON.stringify({latitude: location.coords.latitude, longitude: location.coords.longitude})
              //   }))
              // } catch (error) {
              //   console.log(error);
              // }
              dispatch(updateLocation(location.coords))
          }
        }
  })


  

  const [mainProvider, setMainProvider] = useState('')
  const [canCancel, setCanCancel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [startCancel, setStartCancel] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [lat, setLat] = useState()
  const [lng, setLng] = useState()
  const [allowCheckIn, setAllowCheckIn] = useState(false)
  const [allowCheckOut, setAllowCheckOut] = useState(false)
  const [currentPosition, setCurrentPosition] = useState()

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
    today.setDate(today.getDate() + 8) //testing line
    if(today.toLocaleDateString() == formatDate.toLocaleDateString()){
      if(jobInfo.checkInTime){
        setAllowCheckOut(true)
      }
      else{
        setAllowCheckIn(true)
      }
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

  const checkIn = async () => {
    const original = await DataStore.query(Job, jobInfo.id)
    let today = new Date()
    await DataStore.save(Job.copyOf(original, updated => {
      updated.checkInTime = today.toString()
      updated.currentStatus = 'IN_SERVICE'
    }))
    createToast('You have checked in. Please do not forget to check out after the job is complete')
    let newJobInfo = jobInfo
    newJobInfo.checkInTime = today.toString()
    dispatch(addOrRemoveJob({ type: "REMOVE_ACTIVE_JOB", jobInfo }));
    dispatch(addOrRemoveJob({ type: "ADD_ACTIVE_JOB", jobInfo: newJobInfo }));
    //send notification to the user
    jobInfo = newJobInfo
    let messageInfo = {
      title: 'Checked In',
      message:  `Provider ${mainProvider} has just checked into your home to accommodate your job request`,
      data: {jobID: jobInfo.id}
    }
    await sendNotificationToUser(jobInfo.requestOwner, messageInfo)
    setAllowCheckIn(false)
    setAllowCheckOut(true)
  }

  const checkOut = async () => {
    const original = await DataStore.query(Job, jobInfo.id)
    let today = new Date()
    await DataStore.save(Job.copyOf(original, updated => {
      updated.checkOutTime = today.toString()
      updated.currentStatus = 'COMPLETED'
    }))
    createToast('You have successfully checked out of the job')
    let newJobInfo = jobInfo
    newJobInfo.checkOutTime = today.toString()
    dispatch(addOrRemoveJob({ type: "REMOVE_ACTIVE_JOB", jobInfo }));
    dispatch(addOrRemoveJob({ type: "ADD_COMPLETED_JOB", jobInfo: newJobInfo }));
    jobInfo = newJobInfo
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



  //start service for location
  const startBackgroundLocation = async() => {
      dispatch(resetLocation())
      console.log('getting permissions');
      if(await TaskManager.isTaskRegisteredAsync('BACKGROUND_LOCATION')){
        await Location.stopLocationUpdatesAsync('BACKGROUND_LOCATION')
        console.log('turned off');
      }   
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync()
      console.log(backgroundPermission.status);
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
            let current = await Location.getCurrentPositionAsync()
            if(!current){
              createToast('Please turn on your GPS before attempting to check in')
            }
            else{
              console.log('starting track');
              await Location.startLocationUpdatesAsync('BACKGROUND_LOCATION', {
                showsBackgroundLocationIndicator: true,
                accuracy: Location.Accuracy.Highest,
                foregroundService: {
                    notificationTitle: "Location",
                    notificationBody: "Location tracking in background",
                    notificationColor: "#fff",
                },
                deferredUpdatesInterval: 1000
              })
            }
          }
        }
      }
      else{
        createToast('You must enable location permissions in order to check in')
      }
    
  }
  //get permission for location
  const startForegroundLocation = async() => {
    const foregroundPermission = await Location.requestForegroundPermissionsAsync()
    if(!foregroundPermission.granted){
        createToast('You must enable location permissions on the app in order to check in')
    }
    else{
      let position = await Location.getCurrentPositionAsync()
      if(!position){
        createToast('Your GPS must be turned on to check in')
      }
      else{
        foregroundSubscription?.remove()
        foregroundSubscription = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1
        },
        location => {
          setCurrentPosition(location.coords)
        }
        )
      }
    }
  }

  const stopForegroundLocation = async() => {
    foregroundSubscription?.remove()
    console.log(foregroundSubscription);
    setCurrentPosition(null)
  }

  useEffect(() => {
    console.log(position);
    if(position != null){
      console.log(position.latitude);
      console.log(position.longitude);
      checkProviderRadius()
    }
  },[position])

  const checkProviderRadius = async() => {
    //check if the provider is within the area of the job location
    let check = isPointWithinRadius(
      {latitude: position.latitude, longitude: position.longitude},
      {latitude: parseFloat(jobInfo?.latitude), longitude: parseFloat(jobInfo?.longitude)},
      500)
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

  
  useEffect(() => {
    // startForegroundLocation()
    if(!jobInfo.checkInTime || !jobInfo.checkOutTime){
      startBackgroundLocation()
    }

    getDateFormat()
    getProviders()
    setCanCancel(true)
    //Testing
    // setCoordinatesForMap()
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
          </View>
          <View style={styles.jobContainer}>
            {/* Buttons */}
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
              style={{width: '100%', height: 300}}
              region={{
                latitude: parseFloat(jobInfo?.latitude),
                longitude: parseFloat(jobInfo?.longitude),
                latitudeDelta: 0.0822,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                title="Destination"
                coordinate={{
                  
                  latitude: parseFloat(jobInfo?.latitude),
                  longitude: parseFloat(jobInfo?.longitude)
                }}
                description={`${jobInfo.address} ${jobInfo.city} ${jobInfo.zipCode}`}
              />

            </MapView>
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