import { DataStore, Storage } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  SafeAreaView,
  Dimensions,
  View,
  TouchableOpacity,
  Modal
} from "react-native";
import ProfilePicture from "../../../common/components/ProfilePicture";
import Spinner from "../../../common/components/Spinner";
import { commonStyles } from "../../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Provider, Blacklist } from "../../../src/models";
import { sendProviderAcceptedEmail, sendProviderRejectEmail } from "../../../common/functions";
import { createToast } from "../../../common/components/Toast";




const ApplicantsInfo = ({ navigation, route }) => {
  const {employeeInfo} = route.params
  const [dateStarted, setDateStarted] = useState()
  const [providerImage, setProviderImage] = useState('')
  const [birthDate, setBirthDate] = useState()
  const [address, setAddress] = useState()
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [chosenModal, setChosenModal] = useState('')
  const [operation, setOperation] = useState(false)
  const [backCheck, setBackCheck] = useState(false)

  const getProviderImage = async() => {
    if(employeeInfo.profilePictureURL){
      let img = await Storage.get(employeeInfo.profilePictureURL)
      if(img){
        setProviderImage(img)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    //date started
    let date = new Date(employeeInfo.createdAt)
    setDateStarted(date.toLocaleDateString())
    //birth date
    date = new Date(employeeInfo.dateOfBirth)
    setBirthDate(date.toLocaleDateString())
    //address
    let address = JSON.parse(employeeInfo.address)
    setAddress(address)
    //background check
    if(employeeInfo.backgroundCheckStatus){
      setBackCheck(true)
    }
    //profile picture
    getProviderImage()
  },[])

  if(loading){
    return (
      <Spinner color={'green'} />
    )
  }

  const acceptBackgroundCheck = async() => {
    let original = await DataStore.query(Provider, employeeInfo.id)
    let today = new Date()
    today.setFullYear(today.getFullYear() + 1)
    try {
        await DataStore.save(Provider.copyOf(original, (updated) => {
          updated.backgroundCheckStatus = true
          updated.backgroundCheckDate = today.toString()
        }))
        setBackCheck(true)
        createToast('Applicant background check has been marked as received')
    } catch (error) {
        console.log(error);
    }
  }

  const hireProvider = async() => {
    setOperation(true)
    let original = await DataStore.query(Provider, employeeInfo.id)
    try {
        await DataStore.save(Provider.copyOf(original, (updated) => {
            updated.employeeID = "200"
        }))
    } catch (error) {
        console.log(error);
    }
    await sendProviderAcceptedEmail(original.firstName, original.email)
    setOperation(false)
    navigation.reset({ routes: [{name: 'NewApplicants'}]})
    navigation.navigate('NewApplicants', {name: 'NewApplicants'})
  }

  const rejectProvider = async() => {
    setOperation(true)
    let original = await DataStore.query(Provider, employeeInfo.id)
    await DataStore.save(Provider.copyOf(original, (updated) => {
      updated.isBan = true
      updated.employeeID = -200
    }))
    //add to blacklist
    await DataStore.save(new Blacklist({
      "subID": employeeInfo.subID,
      "email": employeeInfo.email,
      "phoneNumber": employeeInfo.phoneNumber
    }))
    await sendProviderRejectEmail(employeeInfo.firstName, employeeInfo.email)
    setOperation(false)
    navigation.reset({ routes: [{name: 'NewApplicants'}]})
    navigation.navigate('NewApplicants', {name: 'NewApplicants'})
   
  }


  return (
    <KeyboardAwareScrollView>
    <ImageBackground
      style={[commonStyles.background, {flex: 1}]}
      source={require("../../../assets/wyo_background.png")}
    >
      <SafeAreaView style={commonStyles.safeContainer}>
        {/* MODAL */}
        <Modal
            visible={showModal}
            transparent
            animationType="slide"
            hardwareAccelerated
          >
          <View style={styles.centeredView}>
            <View style={styles.warningModal}>
              {chosenModal == 'hire' ? (
                <View>
                  <Text style={styles.modalTitle}>ATTENTION</Text>
                  <Text style={[styles.generalText, {textAlign: 'center', marginTop: 20, marginBottom: 20}]}>
                  You are about to hire {employeeInfo.firstName} {employeeInfo.lastName} as a new provider. Are you sure you want to continue?
                  </Text>
                  {operation ? <Spinner color={'red'}/> : (
                    <View style={{flexDirection:'row', justifyContent: 'space-evenly'}}>
                    <TouchableOpacity onPress={() => {setChosenModal(''); setShowModal(false)}}>
                        <View style={styles.button}>
                          <Text style={styles.btnText}>No</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => hireProvider()}>
                        <View style={styles.button}>
                          <Text style={styles.btnText}>Yes</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ): (
                <View>
                  <Text style={styles.modalTitle}>ATTENTION</Text>
                  <Text style={[styles.generalText, {textAlign: 'center', marginTop: 20}]}>
                  You are about to reject {employeeInfo.firstName} {employeeInfo.lastName} as a provider. Are you sure you want to continue?
                  </Text>
                  <Text style={[styles.dateText, {textAlign: 'center', marginBottom: 20}]}>Note: Rejecting a provider will not allow them to apply again using the same email and phone number</Text>
                  {operation ? <Spinner color={'red'}/> : (
                    <View style={{flexDirection:'row', justifyContent: 'space-evenly'}}>
                    <TouchableOpacity onPress={() => {setChosenModal(''); setShowModal(false)}}>
                        <View style={styles.button}>
                          <Text style={styles.btnText}>No</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => rejectProvider()}>
                        <View style={styles.button}>
                          <Text style={styles.btnText}>Yes</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </Modal>


          <Text style={styles.title}>Applicant Detailed Information</Text>
          <View style={styles.container}>
            <Text style={[styles.dateText, {marginBottom: 5}]}>ID: {employeeInfo.id}</Text>
            <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
              <Text style={styles.name}>{employeeInfo.firstName} {employeeInfo.lastName}</Text>
              <View>
                <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>Date Applied</Text>
                <Text style={[styles.dateText, {alignSelf: 'flex-end'}]}>{dateStarted}</Text>
              </View>
            </View>
            <View style={{marginTop: 10, flexDirection: 'row',}}>
              <ProfilePicture imageUrl={providerImage} name={employeeInfo.firstName + ' ' + employeeInfo.lastName} size={130}/>
            </View>
              <View style={{marginLeft: 10, marginTop: 10}}>
                <Text style={styles.generalText}>Email: {employeeInfo.email}</Text>
                <Text style={styles.generalText}>Phone: {employeeInfo.phoneNumber}</Text>
                <Text style={styles.generalText}>Birth Date: {birthDate}</Text>
                <Text style={styles.generalText}>Address: {address.street} {address.city} {address.zipCode}</Text>
              </View>
              <Text style={[styles.subtitle, {marginTop: 5}]}>Biography</Text>
              <Text style={styles.generalText}>{employeeInfo.biography}</Text>
              
              {/* Buttons */}
              {!backCheck ? (
                <TouchableOpacity onPress={() => acceptBackgroundCheck()}>
                      <View style={[styles.button, {width: 200, height: 45, alignSelf: 'center', marginTop: 20}]}>
                        <Text style={styles.btnText}>Mark Background Check Received</Text>
                      </View>
                  </TouchableOpacity>
              ): (
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30}}>
                  <TouchableOpacity onPress={() => {setChosenModal('hire'); setShowModal(true)}}>
                      <View style={[styles.button, {backgroundColor: 'green'}]}>
                        <Text style={styles.btnText}>Hire</Text>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {setChosenModal('reject'); setShowModal(true)}}>
                      <View style={[styles.button, {backgroundColor: 'red'}]}>
                        <Text style={styles.btnText}>Reject</Text>
                      </View>
                  </TouchableOpacity>
                </View>
              )}
          </View>
          
      </SafeAreaView>
    </ImageBackground>
    </KeyboardAwareScrollView>
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
  container: {
    borderColor: "rgba(0,221,255,0.9)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.9)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
  },
  subtitle:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    borderBottomWidth: 2,
    alignSelf: 'flex-start'
  },
  name: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 25,
    borderBottomWidth: 2,
    alignSelf: 'flex-start'
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
    textAlign: 'center'
  },
  generalText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    fontWeight: '800',
  },
  dateText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090'
  },
  warningModal: {
    width: 360,
    height: 300,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center'
  },
  modalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 17,
    padding: 5,
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    marginBottom: 5,
    alignSelf: 'center',
    textAlign: 'center'
  },
});

export default ApplicantsInfo;
