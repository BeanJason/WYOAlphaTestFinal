import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Dimensions, Pressable } from "react-native";
import { useSelector } from "react-redux";


const JobCard = ({ jobInfo, signUp = false }) => {
  const [date, setDate] = useState("");
  const [numOfProvider, setNumOfProviders] = useState("");
  const navigation = useNavigation();
  const {authUser} = useSelector((state) => state.auth);

  const onPress = () => {
    if(authUser['custom:type'] == 'Provider'){
      if(signUp){
        navigation.navigate('JobSignUp', {name: 'JobSignUp', jobInfo})
      }
      else{
        navigation.navigate('ProviderJobInfo', {name: 'ProviderJobInfo', jobInfo})
      }
    }
    else{
      navigation.navigate('UserJobInfo', {name: 'UserJobInfo', jobInfo})
    }
  }

  useEffect(() => {
    let formatDate = new Date(jobInfo.requestDateTime)
    let hour = formatDate.getHours() % 12 || 12;
    let min =
      (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
    
    let amOrPm = "AM";
    if (formatDate.getHours() >= 12) {
      amOrPm = "PM";
    }
    setDate(formatDate.toLocaleDateString() + " " + hour + ":" + min + amOrPm);
    let count = 0;
    if (jobInfo.mainProvider != null) {
      count++;
    }
    if(jobInfo.backupProviders){
      count += jobInfo.backupProviders.length;
    }
    setNumOfProviders(count);
  }, [jobInfo]);

  return (
      <Pressable onPress={onPress}>
      <View style={styles.jobContainer}>
        <Text style={[styles.generalText, styles.title]}>
          {jobInfo.jobTitle}
        </Text>
        <Text style={[styles.generalText]}>Duration: {jobInfo.duration} Hrs</Text>
        <Text style={[styles.generalText]}>{`${jobInfo.address} ${jobInfo.city} ${jobInfo.zipCode}`}</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={[styles.generalText]}>Date: {date}</Text>
          <Text style={[styles.generalText]}>Num {numOfProvider}</Text>
        </View>
      </View>
      </Pressable>
  );
};

const styles = StyleSheet.create({
  jobContainer: {
    borderColor: "rgba(0,221,255,0.9)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.9)",
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
  },
});

export default JobCard;
