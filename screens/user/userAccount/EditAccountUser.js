import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  FlatList,
  Modal,
  Dimensions,
  TouchableOpacity
} from "react-native";
import UserInput from "../../../common/components/UserInput";
import Spinner from "../../../common/components/Spinner";
import { commonStyles } from "../../../common/styles";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { checkCredentials } from "../../../credentials";
import { DataStore } from "aws-amplify";
import { User } from "../../../src/models";
import { changeUserInfo } from "../../../redux/authReducer";
import { changeUserStatus } from "../../../redux/authReducer";

//Login screen
const EditAccountUser = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [phoneNumber, setphoneNumber] = useState(userInfo.phoneNumber)
  const [address, setAddress] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [startDelete, setStartDelete] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState("");
  const dispatch = useDispatch();

  //Set variables for user input
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  //change phone number
  const changeNumber = async (data) => {
    const original = await DataStore.query(User, userInfo.userID);
    try {
      await DataStore.save(
        User.copyOf(original, (updated) => {
          updated.phoneNumber = data.phoneNumber
        })
      );

      let newInfo = {
        userID: original.id,
        firstName: original.firstName,
        lastName: original.lastName,
        address: original.address,
        phoneNumber: data.phoneNumber,
      };
      dispatch(changeUserInfo({ userInfo: newInfo }));
      setphoneNumber(data.phoneNumber);

    } catch (error) {
      setError('phoneNumber', {
        type: 'validate',
        message: 'Please enter a valid phone number'
      })
    }

  };

  const getUpdatedInfo = async () => {
    const newData = await checkCredentials();
    if(newData.authUser != null && newData.userInfo != null){
      dispatch(changeUserStatus({authUser: newData.authUser, userInfo: newData.userInfo}))
    }
  };

  useEffect(() => {
    getUpdatedInfo()
    let list = [];
    for (let next of userInfo.address) {
      list.push(JSON.parse(next));
    }
    setAddress(list);
  }, []);

  //Get each address as a touchable component
  const GetAddress = (item) => {
    return (
      <View style={styles.addressContainer}>
        <Text
          style={[styles.generalText]}
        >{`${item.item.street} ${item.item.city} ${item.item.zipCode}`}</Text>
        <TouchableOpacity
          onPress={() => {
            setAddressToDelete(item.item.street);
            setShowModal(true);
          }}
          style={{ alignItems: "center" }}
        >
          <FontAwesome name="trash" size={30} />
        </TouchableOpacity>
      </View>
    );
  };

  //Delete address
  const deleteAddress = async () => {
    setStartDelete(true);
    const original = await DataStore.query(User, userInfo.userID);
    let list = [];

    for (let next of original.address) {
      list.push(JSON.parse(next));
    }
    list = list.filter(
      (removeAddress) => removeAddress.street !== addressToDelete
    );
    console.log(list);
    await DataStore.save(
      User.copyOf(original, (updated) => {
        updated.address = updated.address.filter((removeAddress) => {
          removeAddress = JSON.parse(removeAddress);
          return removeAddress.street !== addressToDelete;
        });
      })
    );

    let newList = [];
    for (let next of list) {
      newList.push(JSON.stringify(next));
    }

    let newInfo = {
      userID: original.id,
      firstName: original.firstName,
      lastName: original.lastName,
      address: newList,
      phoneNumber: original.phoneNumber,
    };

    dispatch(changeUserInfo({ userInfo: newInfo }));
    setAddressToDelete("");
    setStartDelete(false);
    setShowModal(false);
    setAddress(list);
  };

  return (
    <ImageBackground
      style={[commonStyles.background, { flex: 1 }]}
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
              <Text style={styles.modalTitle}>Delete Address</Text>
              <Text style={styles.modalText}>
                {" "}
                Are you sure you want to delete this address?
              </Text>
              {startDelete ? (
                <Spinner color={"black"} />
              ) : (
                //Buttons
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginTop: 40,
                  }}
                >
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

        <View style={styles.inputContainer}>
          {/* phone number */}
          <Text style={styles.generalText}>Edit your phone number below</Text>
          <UserInput
            style={styles.input}
            name="phoneNumber"
            icon="phone"
            location="FontAwesome"
            onKeyPress
            maxLength={12}
            keyboardType="numeric"
            rules={{
              required: "Phone Number is Required",
            }}
            placeholder={phoneNumber}
            control={control}
          />
          <TouchableOpacity onPress={handleSubmit(changeNumber)} style={styles.button}>
            <Text style={styles.btnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* address */}
        <Text style={[styles.generalText, styles.addressText]}>
          Add or remove an address
        </Text>
        <View style={{ flex: 1 }}>
          <FlatList
            data={address}
            keyExtractor={(item) => item.street}
            renderItem={({ item }) => <GetAddress item={item} />}
          />
        </View>

        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddAddress", { name: "AddAddress" })
            }
            style={{ alignItems: "center", alignSelf: "center", marginTop: 20 }}
          >
            <MaterialIcons name="add-circle" size={50} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
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
    flexDirection: "row",
    justifyContent: "space-around",
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "column",
  },
  input: {
    width: 300,
    height: 32,
    fontSize: 16,
  },
  generalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 18,
    fontWeight: "800",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  addressText: {
    textAlign: "center",
    marginTop: 20,
    borderBottomWidth: 2,
    alignSelf: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000090",
  },
  warningModal: {
    width: 350,
    height: 300,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: "black",
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: "center",
  },
  modalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 17,
    padding: 5,
    borderBottomColor: "black",
    borderBottomWidth: 3,
    marginBottom: 5,
    alignSelf: "center",
    textAlign: "center",
  },
});

export default EditAccountUser;
