import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { commonStyles } from "../../common/styles";
import { useSelector, useDispatch } from "react-redux";
import { DataStore } from "aws-amplify";
import { Job } from "../../src/models";
import JobCard from "../../common/components/JobCard";
import { TouchableOpacity } from "react-native-web";

const UserHome = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [jobList, setJobList] = useState([]);

  const fetchJobs = async () => {
    await DataStore.query(Job, (job) => {
      job.requestOwner("eq", userInfo.userID) &&
        job.currentStatus("ne", "COMPLETED");
    }).then((jobsFound) => {
      setJobList(jobsFound);
    });
  };

  //Get all current jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <ImageBackground
      style={[commonStyles.background, { height: 1100 }]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={styles.head}>
          <Text style={styles.headerText}>Welcome {userInfo.firstName}</Text>
        </View>
        <View>
          <Text style={[styles.headerText, {textAlign: 'center'}]}>Current Jobs</Text>
        </View>
        <View style={styles.body}>
          <View>
            <FlatList
              data={jobList}
              renderItem={({ item }) => <JobCard jobInfo={item} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  head: {
    flex: 1,
    backgroundColor: "rgba(113, 124, 206, 0.95)",
    alignContent: "flex-start",
    justifyContent: "center",
  },
  body: {
    flex: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  headerText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
  },
});

export default UserHome;
