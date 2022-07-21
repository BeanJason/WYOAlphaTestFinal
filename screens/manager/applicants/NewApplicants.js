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
import Employee from "../../../common/components/Employee";
import Spinner from "../../../common/components/Spinner";
import { commonStyles } from "../../../common/styles";
import * as queries from "../../../src/graphql/queries"






const NewApplicants = ({ navigation }) => {

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [applicantsList, setApplicantsList] = useState([])

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
        { employeeID: {eq: "-1"} },
      ]
    }
    const response = await API.graphql({query: queries.listProviders , variables: {filter: filter}})
    let all = response.data.listProviders.items
    all.sort((a, b) => {
      return a.lastName.toLowerCase() > b.lastName.toLowerCase()
    })
    setApplicantsList(all)
    setLoading(false)
  }

  useEffect(() => {
    setup()
  },[])

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={{alignItems: 'center', marginTop: 15, flex: 1}}>
          <Text style={styles.title}>New Applicants</Text>
            {applicantsList.length == 0 ? 
            <Text style={[styles.helpText, {marginTop: 10}]}>There are currently no new applicants</Text> : (
            <View style={styles.body}>
              {loading ? <Spinner color={'black'} /> : (
                <FlatList
                  keyExtractor={(item) => item.id}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  data={applicantsList}
                  renderItem={({ item }) => <Employee employeeInfo={item} type={'applicants'}/>}
                />
              )}
              </View>
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
});

export default NewApplicants;
