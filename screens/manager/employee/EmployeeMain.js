import { API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  RefreshControl,
  TextInput
} from "react-native";
import Employee from "../../../common/components/Employee";
import Spinner from "../../../common/components/Spinner";
import { commonStyles } from "../../../common/styles";
import * as queries from "../../../src/graphql/queries"
import { FontAwesome } from "@expo/vector-icons"
import { getManyProviders } from "../../../testData";






const EmployeeMain = ({ navigation }) => {

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [employeeList, setEmployeeList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [search, setSearch] = useState('')

  const onRefresh = React.useCallback(async () => {
    setLoading(true)
    setRefreshing(true);
    setup()
    setRefreshing(false);
  }, [refreshing]);

  const setup = async() => {
    let filter = {
      and : [
        {_deleted: {ne: true} },
        {employeeID: {ne: "-1"}}
      ]
    }
    const response = await API.graphql({query: queries.listProviders , variables: {filter: filter}})
    let all = response.data.listProviders.items
    all.sort((a, b) => {
      return a.lastName.toLowerCase() > b.lastName.toLowerCase()
    })
    setEmployeeList(all)
    setLoading(false)
  }

  useEffect(() => {
    setup()
  },[])

  useEffect(() => {
    setFilteredList(employeeList)
  }, [employeeList])


  //Search
  const searchFilter = (text) => {
    if(text){
        const newData = filteredList.filter((item) => {
        return item.lastName.toLowerCase().includes(text.toLowerCase()) ||
        item.firstName.toLowerCase().includes(text.toLowerCase())
      });
      setFilteredList(newData)
      setSearch(text)
    } else {
      setFilteredList(employeeList)
      setSearch(text)
    }
  }


  if(loading){
    return(
      <Spinner color={'black'}/>
    )
  }

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={{alignItems: 'center', marginTop: 15, flex: 1}}>
          <Text style={styles.title}>Employee Database</Text>
          <View style={[commonStyles.inputBorder, styles.searchBar]}>
            <FontAwesome name='search' size={20} style={{alignSelf: 'center'}}/>
            <TextInput 
              value={search}
              placeholder='Search employee name'
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => searchFilter(text)}
            />
            </View>
            {loading ? <Spinner color={'black'} /> : (
              <FlatList
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                data={filteredList}
                renderItem={({ item }) => <Employee employeeInfo={item}/>}
              />
            )}
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
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 35,
    padding: 5,
    alignSelf: 'center',
    borderBottomWidth: 1
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

export default EmployeeMain;
