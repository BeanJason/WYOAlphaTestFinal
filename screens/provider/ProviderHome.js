import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { commonStyles } from "../../common/styles";
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../common/components/JobCard";
import Spinner from "../../common/components/Spinner";
import { get1Job, getManyJobs } from "../../testData";
import { initializeJobs } from "../../redux/jobsProviderReducer";
import { Ionicons } from '@expo/vector-icons'; 
import {RadioButton} from "react-native-paper"
import ProfilePicture from "../../common/components/ProfilePicture";
import * as Notifications from "expo-notifications"





const ProviderHome = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { initialized, activeJobs } = useSelector((state) => state.providerJobs);
  const dispatch = useDispatch()
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true)
  const [checkedBtn, setCheckedBtn] = useState('allJobs')
  const [refreshing, setRefreshing] = React.useState(false);


  const getNotifications = async() => {
    let n = await Notifications.getAllScheduledNotificationsAsync()
    console.log(n);
  }

  const cancelNotifications = async ()=> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }


  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
      dispatch(initializeJobs({userID: userInfo.userID}))
      setRefreshing(false);
  }, [refreshing]);

  //Get all current jobs
  useEffect(() => {
    //Get provider's current jobs
    if(!initialized){
      dispatch(initializeJobs({userID: userInfo.userID}))
    }
    //TESTING
    // setJobList(getManyJobs())


    setLoading(false)
  }, []);

  useEffect(() => {
    if(checkedBtn == 'activeJobs'){
      setJobList(activeJobs.filter(job => job.mainProvider == userInfo.userID))
    }
    else if(checkedBtn == 'backupJobs'){
      setJobList(activeJobs.filter(job => job.backupProviders.includes(userInfo.userID)))
    }
    else{
      setJobList(activeJobs)
    }

  },[activeJobs, checkedBtn])

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
          <View style={[styles.head, {flexDirection: 'row', alignItems:'center'}]}>
            <ProfilePicture imageUrl={userInfo.profilePicture} name={`${userInfo.firstName}  ${userInfo.lastName}`} size={50}/>
            <Text style={styles.name}>Welcome Provider {userInfo.firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => getNotifications()}>
          <Text>Get Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => cancelNotifications()}>
          <Text>cancel Notifications</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerText, {textAlign: 'center'}]}>Active jobs</Text>
        </View>
        {loading ? <Spinner color={'blue'}/> : (
        <View style={styles.body}>
        {/* Radio Buttons */}
        <View style={{flexDirection: "row", alignItems: 'center', justifyContent:'center'}}>
              <RadioButton
                value="allJobs"
                status={checkedBtn === 'allJobs' ? 'checked': 'unchecked'}
                onPress={() => setCheckedBtn('allJobs')}
                color='black'
              />
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>All Jobs</Text>
              <RadioButton
                value="activeJobs"
                status={checkedBtn === 'activeJobs' ? 'checked': 'unchecked'}
                onPress={() => setCheckedBtn('activeJobs')}
                color='black'
              />
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Main Jobs</Text>
              <RadioButton
                value="backupJobs"
                status={checkedBtn === 'backupJobs' ? 'checked': 'unchecked'}
                onPress={() => setCheckedBtn('backupJobs')}
                color='black'
              />
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Backup Jobs</Text>
            </View>
        {jobList.length == 0 ? <Text style={{fontFamily: 'Montserrat-Italic', flex: 1, margin: 20}}>You have no current jobs</Text> : (
          <View style={{flex: 1}}>
            <Text style={styles.helpText}>Click on any of the following jobs for more details</Text>
            <FlatList
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              data={jobList}
              renderItem={({ item }) => <JobCard jobInfo={item} type={'service'}/>}
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

export default ProviderHome;
