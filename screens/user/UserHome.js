import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
} from "react-native";
import { commonStyles } from "../../common/styles";
import { useSelector } from "react-redux";
import { DataStore } from "aws-amplify";
import { Job } from "../../src/models";
import JobCard from "../../common/components/JobCard";
import Spinner from "../../common/components/Spinner";
import { get1Job, getManyJobs } from "../../testData";

const UserHome = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true)
  
  const fetchJobs = async () => {
    await DataStore.query(Job, (job) => {
      job.requestOwner("eq", userInfo.userID) 
    }).then((jobsFound) => {
      jobsFound = jobsFound.filter(j => j.currentStatus != 'COMPLETED')
      setJobList(jobsFound);
    });
  };

  //Get all current jobs
  useEffect(() => {
    setJobList([])
    //Get user's current jobs
    fetchJobs();

    //TESTING
    // setJobList(getManyJobs())

    setLoading(false)
  }, []);

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
    height: '10%'
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
