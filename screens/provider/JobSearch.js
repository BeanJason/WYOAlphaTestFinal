import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  FlatList,
  TouchableOpacity
} from "react-native";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import JobCard from "../../common/components/JobCard";
import DropDownPicker from "react-native-dropdown-picker";
import { API } from "aws-amplify";
import * as queries from "../../src/graphql/queries"
import haversine from "haversine"
import { createToast } from "../../common/components/Toast";
import { checkIfBanned } from "../../common/functions";



const JobSearch = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true);
  const [filteredJobList, setFilteredJobList] = useState([]);
  const [startingLocation, setStartingLocation] = useState()


  //search vars
  const [open, setOpen] = useState(false);
  const [zipCodeSelected, setZipCodeSelected] = useState()
  const [zipCodesList, setZipCodesList ] = useState([]);


  //initial setup
  const initLocation = () => {
    let addr = JSON.parse(userInfo.address)
    let start = {
      latitude: parseFloat(addr.lat),
      longitude: parseFloat(addr.lng)
    }
    setStartingLocation(start)
  }

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
        label: `${area.zipCode} - ${area.city}`,
        value: `${area.zipCode} - ${area.city}`
      })
    }
    setZipCodesList(items)
  }

  const checkProvider = async() => {
    const res = await checkIfBanned(userInfo.userID)
    if(res == true){
      createToast('You cannot search for a job because your account is suspended')
      navigation.navigate('Home')
    } else{
      initLocation()
      setup()
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkProvider();
  }, []);

  const getDistanceToJob = (jobList) => {
    let endLocation = {}
    for(let next of jobList){
      endLocation.latitude = parseFloat(next.latitude)
      endLocation.longitude = parseFloat(next.longitude)
      next.distance = haversine(startingLocation, endLocation, {unit: 'mile'}).toFixed(2)
    }
    return jobList
  }

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
          let all = response.data.listJobs.items
          all = all.filter(job => !job.markedToRemove)
          all = getDistanceToJob(all)
          all.sort((a, b) => a.distance - b.distance)
          setFilteredJobList(all)
      }
      setup()
      getJobsFromZipCode()
    }
  },[zipCodeSelected])


  if(userInfo.employeeID == "-1" || !userInfo.backgroundCheck){
    return(
      <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
       <Text style={[styles.name, {textAlign: 'center', marginTop: 100}]}>You have not been approved yet as a provider. Please wait until approval before searching for jobs</Text>
       <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <View style={[styles.button, {alignSelf: 'center', marginTop: 30}]}>
              <Text style={styles.btnText}>Back</Text>
          </View>
       </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
    )
  }

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
                    renderItem={({ item }) => <JobCard jobInfo={item} type={'signUp'} startLocation={startingLocation}/>}
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
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
});

export default JobSearch;
