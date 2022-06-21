import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, Modal } from "react-native";
import {FontAwesome} from "@expo/vector-icons";
import Spinner from "./Spinner";
import { DataStore, JS } from "aws-amplify";
import { User } from "../../src/models";
import { useDispatch, useSelector } from "react-redux";
import { changeUserInfo } from "../../redux/authReducer";


const Address = ({ address }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch()
    const [showModal, setShowModal] = useState(false)
    const [startDelete, setStartDelete] = useState(false)

    //Delete address
  const deleteAddress = async () => {
      setStartDelete(true)
      const original = await DataStore.query(User, userInfo.userID);
      let list = []

      for(let next of original.address){
        list.push(JSON.parse(next))
      }
      list = list.filter((removeAddress) => removeAddress.street !== address.street)
      await DataStore.save(User.copyOf(original, updated => {
        updated.address = updated.address.filter((removeAddress) => {
            removeAddress = JSON.parse(removeAddress)
            return removeAddress.street !== address.street
        })
      }))

      let newList = []
      for(let next of list){
        newList.push(JSON.stringify(next))
      }

      let newInfo = {
        userID: original.id,
        firstName: original.firstName,
        lastName: original.lastName,
        address: newList,
        phoneNumber: original.phoneNumber
      }
      
      dispatch(changeUserInfo({userInfo: newInfo}))
      setStartDelete(false)
      setShowModal(false)
  }


  return (
     <View style={styles.addressContainer}>
        {/* MODAL */}
        <Modal
            visible={showModal}
            transparent
            animationType='slide'
            hardwareAccelerated
          >
            <View style={styles.centeredView}>
              <View style={styles.warningModal}>
                <Text style={styles.modalTitle}>Delete Address</Text>
                <Text style={styles.modalText}> Are you sure you want to delete this address?
                </Text>
                {startDelete ?  <Spinner color={'black'}/> : (
                  //Buttons
                  <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 40}}>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={styles.button}
                  >
                  <Text style={styles.btnText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteAddress()}
                    style={styles.button}
                  >
                  <Text style={styles.btnText}>Yes</Text>
                  </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>

        <Text style={[styles.generalText]}>{`${address.street} ${address.city} ${address.zipCode}`}</Text>
        <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{alignItems: 'center'}}
        >
            <FontAwesome name="trash" size={30}/>
        </TouchableOpacity>
     </View>
  );
};

const styles = StyleSheet.create({
  addressContainer: {
    borderColor: "rgba(0,221,255,0.9)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.9)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  generalText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090'
  },
  warningModal: {
    width: 350,
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

export default Address;
