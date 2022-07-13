import { useNavigation } from "@react-navigation/native";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Dimensions, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { Job, User } from "../../src/models";
import haversine from "haversine"
import { Fontisto, FontAwesome } from '@expo/vector-icons'; 


const Employee = ({ employeeInfo, type = "" }) => {
  const [dateStarted, setDateStarted] = useState("");
  const navigation = useNavigation()
  const onPress = async () => {
    if(type == 'applicants'){
      navigation.navigate('ApplicantsInfo', {name: 'ApplicantsInfo', employeeInfo})
    }
    else{
      navigation.navigate('EmployeeInfo', {name: 'EmployeeInfo', employeeInfo})
    }
  }

  useEffect(() => {
    let date = new Date(employeeInfo.createdAt)
    setDateStarted(date.toLocaleDateString())
  }, [])

  if(type == 'applicants'){
    return (
      <Pressable onPress={onPress}>
        <View style={styles.jobContainer}>
          <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
            <Text style={[styles.generalText, styles.title]}>{employeeInfo.firstName} {employeeInfo.lastName}</Text>
            <View>
              <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>Date Applied</Text>
              <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>{dateStarted}</Text>
            </View>
          </View>
          <Text style={styles.generalText}>Email: {employeeInfo.email}</Text>
          <Text style={styles.generalText}>Phone #: {employeeInfo.phoneNumber}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <Text style={[styles.generalText, {marginRight: 5}]}>Background Check:</Text>
            {employeeInfo.backgroundCheckStatus ? <FontAwesome style={{color: 'green'}} name={'check-circle'} size={25} /> 
            : <FontAwesome style={{color: 'red'}} name={'times-circle'} size={25} />}
          </View>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
      <Pressable onPress={onPress}>
        <View style={styles.jobContainer}>
          <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
            <Text style={[styles.generalText, styles.title]}>{employeeInfo.firstName} {employeeInfo.lastName}</Text>
            <View>
              <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>Date Started</Text>
              <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>{dateStarted}</Text>
            </View>
          </View>
          <Text style={styles.generalText}>Email: {employeeInfo.email}</Text>
          <Text style={styles.generalText}>Phone #: {employeeInfo.phoneNumber}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.generalText}>Offenses: {employeeInfo.offenses}</Text>
            <View style={{flexDirection: 'row'}}>
              <Fontisto name="star" size={20}/>
              <Text style={styles.generalText}>{employeeInfo.overallRating}</Text>
            </View>
          </View>
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
  dateText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  }
});

export default Employee;
