import {
  StyleSheet,
  TextInput,
  Text,
  Image,
  View,
  ImageBackground,
  SafeAreaView,
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
import { DataStore } from "aws-amplify";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Job } from "../../src/models";
import DropDownPicker from "react-native-dropdown-picker";

//Login screen
const JobCreation1 = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);

  //Set variables for user input
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  //address vars
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [addressList, setAddressList] = useState([]);

  //date vars
  const [dateSelected, setDateSelected] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    let arr = JSON.parse(userInfo.address)
    let items = []
    for(let next of arr){
      items.push({
        label: `${next.street} ${next.city} ${next.zipCode}`,
        value: next.count
      })
    }
    setAddressList(items)
  }, []);

  //On change for the birth date
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    setDateSelected(true);
    setDateError("");
  };

  //Submit the user input
  const submitForm = async (data) => {
    if(value != null){

    }
    else{
      setAddressError('Address is required')
    }
    // data.currentStatus = "REQUESTED";
    // data.requestDateTime = date.toISOString();
    // data.duration = 4;
    // let response;
    // //Check for date error before submit
    // try {
    //   response = await DataStore.save(
    //     new Job({
    //       jobTitle: data.jobTitle,
    //       jobDescription: data.jobDescription,
    //       currentStatus: data.currentStatus,
    //       address: data.address,
    //       city: data.city,
    //       zipCode: data.zipCode,
    //       duration: data.duration,
    //       requestDateTime: data.requestDateTime,
    //       requestOwner: userInfo.userID, //sub id of user
    //     })
    //   );
    // } catch (error) {
    //   console.log(error);
    // }
    // navigation.navigate("JobCreation2", { name: "JobCreation2" });
  };

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header2}>
            Please provide information for your job request
          </Text>

          <View style={styles.inputContainer}>
            {/* job title */}
            <View style={styles.field}>
              <UserInput
                style={styles.input}
                icon="user-circle"
                location="FontAwesome"
                name="jobTitle"
                rules={{ required: "Job title is Required" }}
                placeholder={"Job title"}
                control={control}
              />
            </View>

            {/* address */}
            <View style={styles.field}>
              <DropDownPicker
                placeholder="Address"
                listMode="SCROLLVIEW"
                open={open}
                value={value}
                items={addressList}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setAddressList}
                onOpen={() => setAddressError('')}
              />
              {addressError ? (
                  <Text style={commonStyles.errorMsg}>{addressError}</Text>
                ) : (
                  <></>
                )}


              {/* duration */}
              <UserInput
                style={{ fontSize: 16 }}
                name="duration"
                icon="clockcircle"
                location="AntDesign"
                keyboardType="numeric"
                maxLength={1}
                rules={{
                  required: "Duration is Required",
                }}
                placeholder={"Duration"}
                control={control}
              />

              {/* date of job */}
              <View style={styles.field}>
                <View>
                  <View>
                    <TouchableOpacity
                      onPress={() => setShow(true)}
                      style={[
                        commonStyles.inputBorder,
                        { flexDirection: "row", marginVertical: 5 },
                      ]}
                    >
                      <FontAwesome name="calendar" size={20} style={commonStyles.icon}/>
                      <TextInput style={[styles.input, { color: "black" }]} editable={false} value={
                          dateSelected ? "Date of Request: " + date.toLocaleDateString() : "Date of Request"}
                      ></TextInput>
                    </TouchableOpacity>
                  </View>
                  {show && (
                    <DateTimePicker
                      value={date}
                      onChange={onChange}
                      mode="date"
                    />
                  )}
                </View>
                {dateError ? (
                  <Text style={commonStyles.errorMsg}>{dateError}</Text>
                ) : (
                  <></>
                )}
              </View>
            </View>

            <View style={[styles.field, { flexGrow: 1 }]}>
              <Text style={{ fontFamily: "Montserrat-Bold" }}>
                (Optional) Please provide a description of job request (maximum 350 words)
              </Text>
              {/* Description */}
              <UserInput
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                name="jobDescription"
                multiline
                rules={{
                  maxLength: {
                    value: 350,
                    message: "Description must be 350 words or less",
                  },
                }}
                placeholder={"Description"}
                control={control}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={styles.button}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 20,
  },
  input: {
    width: 300,
    height: 32,
    fontSize: 16,
  },
  field: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
  },
});

export default JobCreation1;
