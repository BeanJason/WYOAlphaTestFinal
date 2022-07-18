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
import { API, DataStore,} from "aws-amplify";
import { Provider, User } from "../../src/models";
import { useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { createToast } from "../../common/components/Toast";
import * as queries from "../../src/graphql/queries"


//Login screen
const ManagerJobInfo = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { jobInfo } = route.params;
  const [mainProvider, setMainProvider] = useState('')
  const [backupProviders, setBackupProviders] = useState([])
  const [owner, setOwner] = useState()
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState()
  const [time, setTime] = useState()
  const [ongoing, setOngoing] = useState(false)
  const [checkInTime, setCheckInTime] = useState()
  const [checkOutTime, setCheckOutTime] = useState()
  const [showModal, setShowModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [lat, setLat] = useState()
  const [lng, setLng] = useState()
  const [prevDate, setPrevDate] = useState()

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
      let providerFound = await DataStore.query(Provider, jobInfo.mainProvider)
      setMainProvider(providerFound)
      if(providerFound.currentLocation){
        let location = providerFound.currentLocation
        location = JSON.parse(location)
        setLat(location.latitude)
        setLng(location.longitude)
        let date = new Date(location.dateUpdated)
        setPrevDate(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`)
      }
    }
    //set backup providers if available
    if(jobInfo.backupProviders && jobInfo.backupProviders.length != 0){
      let listOfBackups = []
      for(let next of jobInfo.backupProviders){
        await DataStore.query(Provider, next).then((providerFound) => {
          listOfBackups.push(`${providerFound.firstName} ${providerFound.lastName}`)
        })
      }
      setBackupProviders(listOfBackups)
    }
  }

  const getOwner = async() => {
    try {
      await DataStore.query(User, jobInfo.requestOwner).then(setOwner)
    } catch (error) {
      console.log(error);
    }
    setLoading(false)
  }

  const refreshLocation = async() => {
    // setRefresh(true)
    let filter = {
      ID: {eq: jobInfo.mainProvider}
   }
   
    let prov = await API.graphql({
      query: queries.getProvider, 
      variables: {id: jobInfo.mainProvider}})
      let location = prov.data.getProvider.currentLocation
      console.log(location);
      if(location){
        location = JSON.parse(location)
        setLat(location.latitude)
        setLng(location.longitude)
        let date = new Date(location.dateUpdated)
        setPrevDate(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`)
      }
      else{
        createToast('Location currently not available')
      }
    setRefresh(false)
  }
  
  useEffect(() => {
    if(jobInfo.currentStatus == 'IN_SERVICE'){
      setOngoing(true)
      if(jobInfo.checkInTime){
        let date = new Date(jobInfo.checkInTime)
        setCheckInTime(date.toLocaleTimeString())
      }
    }
    else if(jobInfo.currentStatus == 'COMPLETED'){
      let date = new Date(jobInfo.checkInTime)
      setCheckInTime(date.toLocaleTimeString())
      date = new Date(jobInfo.checkOutTime)
      setCheckOutTime(date.toLocaleTimeString())
    }
    getDateFormat()
    getProviders()
    getOwner()
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
            animationType="slide"
            hardwareAccelerated
          >
          <View style={styles.centeredView}>
            <View style={styles.warningModal}>
                <View>
                  <View>
                    <Text style={styles.modalTitle}>Current Location of {mainProvider.firstName}</Text>
                    <View style={{flexDirection:'row', justifyContent: 'space-between', marginBottom: 10}}>
                      <View>
                        <Text style={[styles.generalText, {marginLeft: 5}]}>Last location received at:</Text>
                        <Text style={[styles.noteText, {marginLeft: 5}]}>{prevDate || 'Not Available'}</Text>
                      </View>
                      {refresh ? (
                        <Spinner color={'black'} />
                      ): (
                        <TouchableOpacity
                          onPress={() => refreshLocation()}
                          style={{marginRight: 5}}
                        >
                          <FontAwesome name="refresh"  size={40}/>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                    <MapView
                    style={{width: '100%', height: 320, marginBottom: 20}}
                    provider={PROVIDER_GOOGLE}
                    region={{
                      latitude: lat || parseFloat(jobInfo?.latitude),
                      longitude: lng || parseFloat(jobInfo?.longitude),
                      latitudeDelta: 0.0100,
                      longitudeDelta: 0.0100,
                    }}
                  >
                  {lat ? (
                    <Marker
                      title="Position"
                      coordinate={{
                        latitude: lat,
                        longitude: lng
                      }}
                    />
                  ): <></>}
                  </MapView>
                </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[ styles.button, { alignSelf: "center"}]}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


          <Text style={styles.head}>Job Details</Text>
          <View style={styles.jobContainer}>
            <Text style={styles.generalText}>Job ID: {jobInfo.id}</Text>
            <Text style={styles.generalText}>Job Status: {jobInfo.currentStatus}</Text>
            <View>
              {jobInfo.currentStatus == 'COMPLETED' ? <></> : (
                <View>
                  {ongoing ? (
                    <TouchableOpacity onPress={() => setShowModal(true)} style={{alignSelf: 'flex-end'}}>
                      <View style={styles.button}>
                        <FontAwesome name="map-marker" size={25} style={{color: 'white', marginLeft: 5}} />
                        <Text style={styles.btnText}>Current Location</Text>
                      </View>
                    </TouchableOpacity>
                  ): <></>}
                </View>
              )}
              {checkInTime ? <Text style={[styles.generalText, {alignSelf: 'flex-end', marginTop: 5}]}>Checked In: {checkInTime}</Text> : <></>}
              {checkOutTime ? <Text style={[styles.generalText, {alignSelf: 'flex-end'}]}>Checked Out: {checkOutTime}</Text> : <></>}
            </View>
            <Text style={styles.title}>{jobInfo.jobTitle}</Text>
            <Text style={styles.generalText}>Job Owner: {owner.firstName} {owner.lastName}</Text>
            <Text style={styles.generalText}>Job Owner Email: {owner.email}</Text>
            <Text style={[styles.generalText, {marginBottom: 15}]}>Job Owner Phone: {owner.phoneNumber}</Text>
            <Text style={styles.generalText}>Job Address: {jobInfo.address} {jobInfo.city} {jobInfo.zipCode}</Text>
            <Text style={styles.generalText}>Duration: {jobInfo.duration} Hours</Text>
            <Text style={styles.generalText}>Scheduled for {date}</Text>
            <Text style={[styles.generalText, {marginBottom: 30}]}>{time}</Text>
            {jobInfo.jobDescription ? 
            <View>
              <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Job Description</Text> 
              <Text style={[styles.generalText, {marginBottom: 10}]}>{jobInfo.jobDescription}</Text> 
            </View>
            : <></>}
            <Text style={[styles.subtitle, { borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Main Provider</Text>
              {mainProvider ? (
                  <Text style={[styles.generalText]}>{mainProvider.firstName}</Text>
              ): (
                  <Text style={styles.generalText}>None</Text>
              )}            
            {backupProviders.length == 0 ? <></> : (
              <View style={{marginTop: 20}}>
                <Text style={[styles.subtitle, {borderBottomWidth: 1, alignSelf: 'flex-start'}]}>Backup Providers</Text>
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
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: 'row',
    width: 120,
    height: 45,
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
    width: 360,
    height: 500,
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
    textAlign: 'center'
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
  subtitle:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
  },
  noteText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default ManagerJobInfo;
