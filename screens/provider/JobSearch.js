import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity
} from "react-native";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons"
import JobCard from "../../common/components/JobCard";
import DropDownPicker from "react-native-dropdown-picker";
import { getJobHistory } from "../../testData";
import { initializeJobs } from "../../redux/jobsReducer";
import { API, DataStore, graphqlOperation } from "aws-amplify";
import { Job } from "../../src/models";
import * as queries from "../../src/graphql/queries"



const JobSearch = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true);
  const [filteredJobList, setFilteredJobList] = useState([]);
  const zipCodeMap = new Map();
  const [allJobs, setAllJobs] = useState([])
  const [sortDirection, setSortDirection] = useState('ascend')


  //search vars
  const [open, setOpen] = useState(false);
  const [zipCodeSelected, setZipCodeSelected] = useState()
  const [zipCodesList, setZipCodesList ] = useState([]);


  //initial setup
  const setup = async () => {
    //get all jobs requested or accepted
    let filter = {
      and: [
        { _deleted: {ne: true} },
        {mainProvider: {ne: userInfo.userID}},
        {backupProviders: {notContains: userInfo.userID}},
        {
          or:[
            { currentStatus: {eq: 'REQUESTED'} },
            { currentStatus: {eq: 'ACCEPTED'} }
          ]
        }
      ]
    }
    const response = await API.graphql({query: queries.listJobs, variables: {filter: filter}})
    let all = response.data.listJobs.items
    setAllJobs(all)
    //map all zipCodes
    let count = 0;
    for(let job of all){
      count = zipCodeMap.get(`${job.zipCode} - ${job.city}`)
      if(count == undefined){
        zipCodeMap.set(`${job.zipCode} - ${job.city}`, 0)
      }
      else{
        zipCodeMap.set(`${job.zipCode} - ${job.city}`, ++count)
      }
    }
    //map providers zip code
    count = zipCodeMap.get(`${userInfo.zipCode} - ${userInfo.city}`)
    if(count == undefined){
      zipCodeMap.set(`${userInfo.zipCode} - ${userInfo.city}`, 0)
    }
    else{
      zipCodeMap.set(`${userInfo.zipCode} - ${userInfo.city}`, count)
    }

    //set zip codes in search bar
    let items = []
    for(const area of zipCodeMap.keys()){
      items.push({
        label: area,
        value: area
      })
    }
    setZipCodesList(items)
    setZipCodeSelected(`${userInfo.zipCode} - ${userInfo.city}`)
  }
  
  useEffect(() => {
    setup()
    setLoading(false)
  }, []);

  useEffect(() => {
    if(zipCodeSelected){
      let zip = zipCodeSelected.split(' ')[0]
      setFilteredJobList(allJobs.filter(job => job.zipCode == zip))
    }
  },[zipCodeSelected])


  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View>
          <Text style={[styles.headerText, {textAlign: 'center'}]}>Job Search</Text>
          <Text style={styles.helpText}>Click on any of the following jobs to sign up as a provider</Text>
        </View>
        <View style={styles.body}>
          <View>
              <View style={{marginRight: 10, alignItems: 'center'}}>
                <View style={styles.field}>
                <DropDownPicker
                  style={{width: 320}}
                  textStyle={{fontFamily: "Montserrat-Bold"}}
                  modalContentContainerStyle={styles.warningModal}
                  placeholder= {'Town: ' + zipCodeSelected}
                  listMode="MODAL"
                  searchable={true}
                  searchPlaceholder='Select a town to see the available jobs'
                  open={open}
                  value={'Town: ' + zipCodeSelected}
                  items={zipCodesList}
                  setOpen={setOpen}
                  setValue={setZipCodeSelected}
                  setItems={setZipCodesList}
                />
                </View>
              </View>
              
            {loading ? <Spinner color={'blue'} /> : (
              <View style={{flex: 1, marginTop: 10, marginBottom: 20}}>
                {filteredJobList.length == 0 && !open ? 
                <Text style={styles.helpText}>There are no available jobs currently in the {zipCodeSelected} area.</Text>
                :(
                  <View>
                    <Text style={styles.helpText}>There are {filteredJobList.length} available jobs in the {zipCodeSelected} area.</Text>
                    <FlatList
                    data={filteredJobList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <JobCard jobInfo={item} signUp={true} />}
                  />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
  },
  field: {
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
  },
  warningModal: {
    textAlign: 'center',
    margin: 10
  },
});

export default JobSearch;
