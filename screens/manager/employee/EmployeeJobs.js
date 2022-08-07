import { API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  RefreshControl
} from "react-native";
import Spinner from "../../../common/components/Spinner";
import { commonStyles } from "../../../common/styles";
import * as queries from "../../../src/graphql/queries"
import {RadioButton} from "react-native-paper"
import JobCard from "../../../common/components/JobCard";

const EmployeeJobs = ({ navigation, route }) => {
  const {employeeInfo} = route.params
  const [jobList, setJobList] = useState([])
  const [filteredJobList, setFilteredJobList] = useState([])
  const [checkedBtn, setCheckedBtn] = useState('activeJobs')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = React.useCallback(async () => {
    setLoading(true)
    setRefreshing(true);
    setup()
    setRefreshing(false);
  }, [refreshing]);

  const setup = async() => {
    //get jobs
    let filter = {
      and: [
        { _deleted: {ne: true} },
        {
          or: [
            {mainProvider: {eq: employeeInfo.id}},
            {backupProviders: {contains: employeeInfo.id}},
          ]
        }
        
      ]
    }
    const response = await API.graphql({query: queries.listJobs, variables: {filter: filter}})
    let all = response.data.listJobs.items
    all = all.filter(job => !job.markedToRemove)
    setJobList(all)
    setLoading(false)
  }

  useEffect(() => {
    setup()
  },[])

  useEffect(() => {
    setFilteredJobList(jobList)
  }, [jobList])

  useEffect(() => {
    if(checkedBtn == 'ongoingJobs'){
      setFilteredJobList(jobList.filter(job => job.currentStatus == 'IN_SERVICE'))
    }
    else if(checkedBtn == 'activeJobs'){
      setFilteredJobList(jobList.filter(job => job.currentStatus != 'COMPLETED' && job.currentStatus != 'FAILED'))
    }
    else {
      setFilteredJobList(jobList.filter(job => job.currentStatus == 'COMPLETED'))
    }
  },[jobList, checkedBtn])
  

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text style={styles.title}>Provider Job Information</Text>
        {loading ? <Spinner color={'white'}/> : (
          <View style = {styles.body}> 
            {/* Radio Buttons */}
            <View style={{flexDirection: "row", alignItems: 'center', justifyContent:'space-around'}}>
                  <RadioButton
                    value="completedJobs"
                    status={checkedBtn === 'completedJobs' ? 'checked': 'unchecked'}
                    onPress={() => setCheckedBtn('completedJobs')}
                    color='black'
                  />
                  <Text style={{fontFamily: 'Montserrat-Bold', margin: 5}}>Completed Jobs</Text>
                  <RadioButton
                    value="activeJobs"
                    status={checkedBtn === 'activeJobs' ? 'checked': 'unchecked'}
                    onPress={() => setCheckedBtn('activeJobs')}
                    color='black'
                  />
                  <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Active Jobs</Text>
                  <RadioButton
                    value="ongoingJobs"
                    status={checkedBtn === 'ongoingJobs' ? 'checked': 'unchecked'}
                    onPress={() => setCheckedBtn('ongoingJobs')}
                    color='black'
                  />
                  <Text style={{fontFamily: 'Montserrat-Bold', margin: 10}}>Ongoing Jobs</Text>
            </View>
            <Text style={[styles.subTitle, {marginTop: 15}]}>{checkedBtn == 'activeJobs' ? 'Active Jobs' : checkedBtn == 'ongoingJobs' ? 'Currently In Service' : 'Completed Jobs'}</Text>
            {filteredJobList.length == 0 ? <Text style={{fontFamily: 'Montserrat-Italic', flex: 1, margin: 20}}>There are no current jobs in this category</Text> : (
              <View style={{flex: 1}}>
                <Text style={styles.helpText}>Click on any of the following jobs for more details</Text>
                <FlatList
                  keyExtractor={(item) => item.id}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  data={filteredJobList}
                  renderItem={({ item }) => <JobCard jobInfo={item} type={'manager'} role={employeeInfo.id == item.mainProvider ? 'main' : 'backup'}/>}
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
  title:{
    fontSize: 30,
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center'
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  helpText: {
    fontFamily: 'Montserrat-Italic',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
  },
  subTitle:{
    fontSize: 25,
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    borderBottomWidth: 1
  },
});

export default EmployeeJobs;
