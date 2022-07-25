import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList
} from "react-native";
import { commonStyles } from "../../../common/styles";
import { MaterialIcons } from '@expo/vector-icons'; 
import ReviewCard from "../../../common/components/ReviewCard";
import { DataStore } from "aws-amplify";
import { Provider, Review } from "../../../src/models";




const EmployeeReviews = ({ navigation, route }) => {
  const {employeeInfo} = route.params
  const [roundedOverall, setRoundedOverall] = useState(0)
  const [reviews, setReviews] = useState([])


  const setList = async() => {
    let list = [];
    let reviews = await DataStore.query(Review, employeeInfo.providerReviewID)
    if(reviews[0]){
      for (let next of reviews[0].reviews) {
        list.push(JSON.parse(next));
      }
    }
    setReviews(list);
  }

  useEffect(() => {
    setList()
    let overall = (Math.round(employeeInfo.overallRating * 2) / 2)
    setRoundedOverall(overall)
  },[])



  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.title}>Reviews for Provider {employeeInfo.firstName} {employeeInfo.lastName}</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15}}>
                <Text style={[styles.subtitle, {alignSelf: 'center'}]}>Overall Rating</Text>
                <View style={{flexDirection:'row', justifyContent: 'center', marginTop: 10}}>
                  <MaterialIcons name={0.5 == roundedOverall ? 'star-half' : 1 > roundedOverall ? 'star-outline' : 'star'} size={35} color={'yellow'}/>
                  <MaterialIcons name={1.5 == roundedOverall ? 'star-half' : 2 > roundedOverall ? 'star-outline' : 'star'} size={35} color={'yellow'}/>
                  <MaterialIcons name={2.5 == roundedOverall ? 'star-half' : 3 > roundedOverall ? 'star-outline' : 'star'} size={35} color={'yellow'}/>
                  <MaterialIcons name={3.5 == roundedOverall ? 'star-half' : 4 > roundedOverall ? 'star-outline' : 'star'} size={35} color={'yellow'}/>
                  <MaterialIcons name={4.5 == roundedOverall ? 'star-half' : 5 > roundedOverall ? 'star-outline' : 'star'} size={35} color={'yellow'}/>
                  <Text style={[styles.generalText, {alignContent:'center'}]}>{roundedOverall}/5</Text>
                </View>
              </View>
              {reviews.length == 0 ? <Text style={styles.dateText}>There are no reviews for this provider</Text> : (
                <FlatList
                    keyExtractor={(item) => item.jobID}
                    data={reviews}
                    renderItem={({ item }) => <ReviewCard review={item}/>}
                  />
              )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  title:{
    fontSize: 30,
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center'
  },
  subtitle:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    borderBottomWidth: 2,
    alignSelf: 'flex-start'
  },
  name: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 25,
    borderBottomWidth: 2,
    alignSelf: 'flex-start'
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
  },
  fireButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 40,
    backgroundColor: "red",
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  generalText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    fontWeight: '800',
  },
  dateText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default EmployeeReviews;
