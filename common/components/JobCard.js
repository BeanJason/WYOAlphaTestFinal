import { useNavigation } from "@react-navigation/native";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Dimensions, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { Job, User } from "../../src/models";
import { Fontisto } from '@expo/vector-icons'; 


const JobCard = ({ jobInfo, type = '', role = '' }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [numOfProvider, setNumOfProviders] = useState("");
  const navigation = useNavigation();
  const {authUser} = useSelector((state) => state.auth);
  const [active, setActive] = useState(false)

  const onPress = async () => {
    if(authUser['custom:type'] == 'Provider'){
      if(type == 'signUp'){
        navigation.navigate('JobSignUp', {name: 'JobSignUp', jobInfo})
      }
      else if(type == 'service'){
        const owner = await DataStore.query(User, jobInfo.requestOwner)
        const updatedJob = await DataStore.query(Job, jobInfo.id)
        navigation.navigate('ServiceView', {name: 'ServiceView', jobInfo: updatedJob, owner})
      }
      else{
        navigation.navigate('ProviderJobInfo', {name: 'ProviderJobInfo', jobInfo})
      }
    }
    else if(authUser['custom:type'] == 'Manager'){
      if(type == 'manager'){
        navigation.navigate('ManagerJobInfo', {name: 'ManagerJobInfo', jobInfo})
      }
    }
    else{
      navigation.navigate('UserJobInfo', {name: 'UserJobInfo', jobInfo})
    }
  }

  const getRequestOwnerName = async () => {
      await DataStore.query(User, jobInfo.requestOwner).then((user) => setOwnerName(user.firstName + " " + user.lastName))
      .catch((error) => console.log(error))
  }

  useEffect(() => {
    let formatDate = new Date(jobInfo.requestDateTime)
    let hour = formatDate.getHours() % 12 || 12;
    let min =
      (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
    
    let amOrPm = "AM";
    let durationAmOrPm = "AM"
    let durationHour = (formatDate.getHours() + jobInfo.duration) % 12 || 12
    if (formatDate.getHours() >= 12) {
      amOrPm = "PM";
    }
    if(formatDate.getHours() + jobInfo.duration >= 12){
      durationAmOrPm = "PM"
    }

    setDate(formatDate.toLocaleDateString());
    setTime(`from ${hour}:${min}${amOrPm}-${durationHour}:${min}${durationAmOrPm}`)
    let count = 0;
    if (jobInfo.mainProvider != null) {
      count++;
    }
    if(jobInfo.backupProviders){
      count += jobInfo.backupProviders.length;
    }
    setNumOfProviders(count);
    getRequestOwnerName();
    //check if active for today
    let today = new Date()
    if(formatDate.toLocaleDateString() == today.toLocaleDateString()){
      setActive(true)
    }
  }, [jobInfo]);

  return (
      <Pressable onPress={onPress}>
      <View style={active ? styles.jobContainerActive: styles.jobContainer}>
        {type == 'manager' && role ? <Text style={[styles.noteText, {alignSelf: 'flex-end'}]}>Role: {role == 'main' ? 'Main Provider': role == 'backup' ? 'Backup Provider' : <></>} </Text> : <></>}
        <Text style={[styles.generalText, styles.title]}>
          {jobInfo.jobTitle}
        </Text>
        <Text style={styles.generalText}>Request Owner: {ownerName}</Text>
        <Text style={styles.generalText}>Duration: {jobInfo.duration} Hrs</Text>
        {type == 'service' ? <Text style={styles.generalText}>Address: {`${jobInfo.address} ${jobInfo.city} ${jobInfo.zipCode}`}</Text>: <></> }
        <Text style={styles.generalText}>Date: {date}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.generalText}>Time: {time}</Text>
            
          <Text style={styles.generalText}><Fontisto name="person" size={24} color="black" />{numOfProvider}</Text>
        </View>
        {type == 'signUp' ? <Text style={[styles.generalText, {marginTop: 20}]}>~Distance: {jobInfo.distance} mi.</Text> : <></>}
      </View>
      </Pressable>
  );
};

const styles = StyleSheet.create({
  jobContainer: {
    //borderColor: "rgba(0,221,255,0.9)",
    borderColor: "rgba(241,190,72,0.9)",
    borderWidth: 1,
    //backgroundColor: "rgba(0,221,255,0.9)",
    backgroundColor: "rgba(241,190,72,0.9)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
    // height: '50%'
  },
  jobContainerActive: {
    //borderColor: "rgba(0,221,255,0.9)",
    borderColor: "green",
    borderWidth: 3,
    //backgroundColor: "rgba(0,221,255,0.9)",
    backgroundColor: "rgba(134, 254, 172, 0.8)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
    // height: '50%'
  },
  title:{
    borderBottomColor:'black',
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    fontSize: 23,
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  generalText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    marginRight: 5,
  },
  noteText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default JobCard;
