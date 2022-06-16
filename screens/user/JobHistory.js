import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    SafeAreaView,
    FlatList,
    TextInput
  } from "react-native";
  import { TouchableOpacity } from "react-native";
  import UserInput from "../../common/components/UserInput";
  import Spinner from "../../common/components/Spinner";
  import { commonStyles } from "../../common/styles";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import { useForm } from "react-hook-form";
  import { useSelector, useDispatch } from "react-redux";
  import { login, resetState } from "../../redux/authReducer";
  import { useEffect, useState } from "react";
  import { FontAwesome } from "@expo/vector-icons"
  import JobCard from "../../common/components/JobCard";
  import { getJobHistory } from "../../testData";

  
  const JobHistory = ({ navigation }) => {
    const [jobList, setJobList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredJobList, setFilteredJobList] = useState([]);
    const [search, setSearch] = useState('');
    const [sortDirection, setSortDirection] = useState('ascend')

    const fetchJobs = async () => {
      await DataStore.query(Job, (job) => {
        job.requestOwner("eq", userInfo.userID) &&
          job.currentStatus("eq", "COMPLETED");
      }).then((jobsFound) => {
        setJobList(jobsFound);
        setFilteredJobList(jobsFound)
      });
    };

    //Get all completed jobs
    useEffect(() => {
      // fetchJobs();

      //TESTING
      setJobList(getJobHistory())
      setFilteredJobList(getJobHistory())

      setLoading(false)
    }, []);

    //Search
    const searchFilter = (text) => {
      if(text){
        const newData = filteredJobList.filter((item) => {
          return item.jobTitle.toLowerCase().includes(text.toLowerCase())
        });
        setFilteredJobList(newData)
        setSearch(text)
      } else {
        setFilteredJobList(jobList)
        setSearch(text)
      }
    }

    //Sort
    const sortByDate = () => {
      if(sortDirection == 'ascend'){
        setFilteredJobList([...filteredJobList].sort((a, b) => {
          return new Date(a.requestDateTime) - new Date(b.requestDateTime)
        }))
        setSortDirection('descend')
      }
      else{
        setFilteredJobList([...filteredJobList].sort((a, b) => {
          return new Date(b.requestDateTime) - new Date(a.requestDateTime)
        }))
        setSortDirection('ascend')
      }
    }
  
    return (
      <ImageBackground
        style={[commonStyles.background, {flex: 1}]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <View>
            <Text style={[styles.headerText, {textAlign: 'center'}]}>Job History</Text>
          </View>
          {loading ? <Spinner color={'blue'}/> : (
          <View style={styles.body}>
          {jobList.length == 0 ? <Text style={{fontFamily: 'Montserrat-Italic', flex: 1, margin: 20}}>You have no job history</Text> : (
            <View style={{flex: 1}}>
              <View style={[commonStyles.inputBorder, styles.searchBar]}>
                <FontAwesome name='search' size={20} style={{alignSelf: 'center'}}/>
                <TextInput 
                  value={search}
                  placeholder='Search by job title'
                  underlineColorAndroid={'transparent'}
                  onChangeText={(text) => searchFilter(text)}
                />
              </View>
              <Text style={styles.helpText}>Click on any of the following jobs for more details</Text>
              <View style={{alignItems: 'flex-end'}}>
                <View style={{marginRight: 10, alignItems: 'center'}}>
                  <Text style={[styles.helpText, {alignItems:'center', marginBottom: 0}]}>Sort by date</Text>
                  <TouchableOpacity onPress={sortByDate}>
                    <FontAwesome name="sort" size={35} />
                  </TouchableOpacity>
                </View>
              </View>
              <FlatList
                data={filteredJobList}
                keyExtractor={(item, index) => index.toString()}
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
    },
    searchBar: {
      width: 350, 
      alignSelf: 'center', 
      marginTop: 10, 
      flexDirection: 'row'
    }
  });
  
  export default JobHistory;
  