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
import {RadioButton} from "react-native-paper"
import { API } from "aws-amplify";
import * as queries from "../../src/graphql/queries"





const ManagerHome = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const [jobList, setJobList] = useState([]);
  const [filteredJobList, setFilteredJobList] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkedBtn, setCheckedBtn] = useState('allJobs')
  const [refreshing, setRefreshing] = useState(false);
  let today = new Date();
  let nextDate;

  const onRefresh = React.useCallback(async () => {
    setLoading(true)
    setRefreshing(true);
    setup()
    setRefreshing(false);
  }, [refreshing]);


  const setup = async() => {
      let filter = {
        and: [
          { _deleted: {ne: true} },
          { currentStatus: {ne: 'COMPLETED'} },
        ]
      }
      const response = await API.graphql({query: queries.listJobs, variables: {filter: filter}})
      let all = response.data.listJobs.items
      setJobList(all)
      setLoading(false)
  }

  //Get all current jobs
  useEffect(() => {
    //TESTING
    // setJobList(getManyJobs())
    setup()
  }, []);

  useEffect(() => {
    if(checkedBtn == 'jobsToday'){
      setFilteredJobList(jobList.filter(job => {
        nextDate = new Date(job.requestDateTime)
        return today.toLocaleDateString() == nextDate.toLocaleDateString()
      }))
    }
    else if(checkedBtn == 'ongoingJobs'){
      setFilteredJobList(jobList.filter(job => job.currentStatus == 'IN_SERVICE'))
    }
    else {
      setFilteredJobList(jobList)
    }
  },[jobList, checkedBtn])

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
          <View style={[styles.head, {flexDirection: 'row', alignItems:'center'}]}>
            <Text style={styles.name}>Welcome Manager {userInfo.firstName}</Text>
          </View>
        <View>
          <Text style={[styles.headerText, {textAlign: 'center'}]}>{checkedBtn == 'allJobs' ? 'Active Jobs': checkedBtn == 'jobsToday' ? 'Jobs Today': 'Ongoing Jobs'}</Text>
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
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 5}}>All Jobs</Text>
              <RadioButton
                value="jobsToday"
                status={checkedBtn === 'jobsToday' ? 'checked': 'unchecked'}
                onPress={() => setCheckedBtn('jobsToday')}
                color='black'
              />
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Today's Jobs</Text>
              <RadioButton
                value="ongoingJobs"
                status={checkedBtn === 'ongoingJobs' ? 'checked': 'unchecked'}
                onPress={() => setCheckedBtn('ongoingJobs')}
                color='black'
              />
              <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Ongoing Jobs</Text>
          </View>
        {filteredJobList.length == 0 ? <Text style={{fontFamily: 'Montserrat-Italic', flex: 1, margin: 20}}>There are no current jobs in this category</Text> : (
          <View style={{flex: 1}}>
            <Text style={styles.helpText}>Click on any of the following jobs for more details</Text>
            <FlatList
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              data={filteredJobList}
              renderItem={({ item }) => <JobCard jobInfo={item} type={'manager'}/>}
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

export default ManagerHome;
