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
import { Global, Job } from "../../src/models";
import * as queries from "../../src/graphql/queries"



const JobSearch = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true);
  const [filteredJobList, setFilteredJobList] = useState([]);
  const [sortDirection, setSortDirection] = useState('ascend')


  //search vars
  const [open, setOpen] = useState(false);
  const [zipCodeSelected, setZipCodeSelected] = useState()
  const [zipCodesList, setZipCodesList ] = useState([]);


  //initial setup
  const setup = async () => {
    let filter = {
       count: {ne: 0}
    }
    let global = await API.graphql({query: queries.listCodes, variables: {filter: filter}})
    let list = global.data.listCodes.items

    //set zip codes in search bar
    let items = []
    for(const area of list){
      items.push({
        label: `${area.zipCode} - ${area.city}` ,
        value: `${area.zipCode} - ${area.city}`
      })
    }
    setZipCodesList(items)
  }
  
  useEffect(() => {
    setup()
    setLoading(false)
  }, []);

  useEffect(() => {
    if(zipCodeSelected){
      let zip = zipCodeSelected.split(' ')[0]
      const getJobsFromZipCode = async () => {
         //get jobs from selected zip code
          let filter = {
            and: [
              { _deleted: {ne: true} },
              {mainProvider: {ne: userInfo.userID}},
              {backupProviders: {notContains: userInfo.userID}},
              {zipCode: {eq: zip}},
              {
                or:[
                  { currentStatus: {eq: 'REQUESTED'} },
                  { currentStatus: {eq: 'ACCEPTED'} }
                ]
              }
            ]
          }
          const response = await API.graphql({query: queries.listJobs, variables: {filter: filter}})
          const all = response.data.listJobs.items
          setFilteredJobList(all)
      }
      setup()
      getJobsFromZipCode()
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
                  placeholder= { zipCodeSelected ? 'Town: ' + zipCodeSelected : "Select a city"}
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
                <Text style={styles.helpText}>There are no available jobs currently in the selected area.</Text>
                :(
                  <View>
                    <Text style={styles.helpText}>There are {filteredJobList.length} available job(s) in the {zipCodeSelected} area.</Text>
                    <FlatList
                    data={filteredJobList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <JobCard jobInfo={item} type={'signUp'} />}
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
