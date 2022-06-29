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
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../common/components/JobCard";
import Spinner from "../../common/components/Spinner";
import { get1Job, getManyJobs } from "../../testData";
import { initializeJobs } from "../../redux/jobsReducer";
import { TouchableOpacity } from "react-native-web";
import { Ionicons } from '@expo/vector-icons'; 

const JobSearch1 = ({ navigation }) => {

  return (
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        <Text>Provider job search screen</Text>
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

export default JobSearch1;
