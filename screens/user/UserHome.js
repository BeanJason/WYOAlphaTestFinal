import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl
} from "react-native";
import { commonStyles } from "../../common/styles";
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../common/components/JobCard";
import Spinner from "../../common/components/Spinner";
import { get1Job, getManyJobs } from "../../testData";
import { initializeJobs } from "../../redux/jobsReducer";
import * as Notifications from "expo-notifications"
import { registerForNotifications, updateExpoToken } from "../../common/functions";
import { changeExpoToken } from "../../redux/authReducer";

const UserHome = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { initialized, activeJobs } = useSelector((state) => state.jobs);
  const dispatch = useDispatch()
  const [jobList, setJobList] = useState(activeJobs);
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = React.useState(false);

  //listen to token changes
  useEffect(() => {
    const subscription = Notifications.addPushTokenListener(async() => {
      let token = await registerForNotifications()
      await updateExpoToken('User', userInfo.userID, token)
      dispatch(changeExpoToken(token))
    })
    return () => subscription.remove()
  }, [])
  

  const trigger = () => {
    Notifications.scheduleNotificationAsync({
      content:{
        title: 'test notification',
        body: 'this is a test notification message'
      },
      
      trigger:{
        seconds: 10
      }
    })
  }

  

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    dispatch(initializeJobs({
      userID: userInfo.userID
    }))
    setRefreshing(false);
  }, [refreshing]);

  //Get all current jobs
  useEffect(() => {
    //Get user's current jobs
    if(!initialized){
      dispatch(initializeJobs({userID: userInfo.userID}))
    }
    trigger()
    //TESTING
    // setJobList(getManyJobs())
    setLoading(false)
  }, []);

  useEffect(() => {
    setJobList(activeJobs)
  },[activeJobs])

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={styles.head}>
          <Text style={styles.name}>Welcome {userInfo.firstName}</Text>
        </View>
        <View>
          <Text style={[styles.headerText, {textAlign: 'center'}]}>Active Jobs</Text>
        </View>
        {loading ? <Spinner color={'blue'}/> : (
        <View style={styles.body}>
        {jobList.length == 0 ? <Text style={{fontFamily: 'Montserrat-Italic', flex: 1, margin: 20}}>You have no current jobs</Text> : (
          <View style={{flex: 1}}>
            <Text style={styles.helpText}>Click on any of the following jobs for more details</Text>
            <FlatList
              keyExtractor={(item) => item.id}
              refreshControl = {
                  <RefreshControl refreshing = {refreshing}
                  onRefresh = {onRefresh}
                  />}
              data={jobList}
              renderItem={({ item }) => <JobCard jobInfo={item} />}
            />
          </View>
        )}
        </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  head: {
    backgroundColor: "rgba(113, 124, 206, 0.95)",
    alignContent: "flex-start",
    justifyContent: 'center',
    height: '10%',
    marginTop: 10
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  name: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
  },
  headerText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 30,
    padding: 5,
    marginBottom: 10,
    borderBottomWidth: 2,
    alignSelf: 'center'
  },
  helpText: {
    fontFamily: 'Montserrat-Italic',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
  }
});

export default UserHome;
