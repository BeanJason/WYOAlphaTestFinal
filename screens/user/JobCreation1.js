import {
  StyleSheet,
  TextInput,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import UserInput from "../../common/components/UserInput";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import NumericInput from 'react-native-numeric-input';

const JobCreation1 = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  //Set variables for user input
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  
  const [duration, setDuration] = useState(4)

  //address vars
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [addressList, setAddressList] = useState([]);
  
  //date vars
  const [dateSelected, setDateSelected] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [dateError, setDateError] = useState("");
  const [mode, setMode] = useState('date');
  const [dateOfToday, setDateOfToday] = useState(new Date())


  useEffect(() => {
    let nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + 1)
    setDateOfToday(nextDay)

    let items = []
    let addr
    for(let next of userInfo.address){
      addr = JSON.parse(next)
      items.push({
        label: `${addr.street} ${addr.city} ${addr.zipCode}`,
        value: addr.street
      })
    }
    items.push({
      label: 'Add new address',
      value: -1
    })
    setAddressList(items)
  }, []);

  //On change for the date
  const onChange = (event, selectedDate) => {
    if(mode == 'date' && event.type == 'dismissed'){
      selectedDate = dateOfToday
    }
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    setDateSelected(true);
    setDateError("");
  };

  //cancel date 
  const canceDate = () => {
    console.log('cancel');
  }

  //set mode for date/time
  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const get12HourTime = () => {
    let hours = date.getHours() % 12 || 12;
    let min = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    let amOrPm = "AM";
    if (date.getHours() >= 12) {
      amOrPm = "PM";
    }
    return hours + ':' + min + amOrPm
  }

  //Submit the user input
  const submitForm = async (data) => {
    if(dateSelected == false){
      setDateError('A requested date and time must be chosen')
    }
    if(address == null){
      setAddressError('Address is required')
    }
    //Success
    if(addressError == '' && dateError == ''){
      data.currentStatus = "REQUESTED";
      let finalDate = date.toString()
      data.requestDateTime = finalDate
      data.duration = duration;
      if(data.jobDescription == null){
        data.jobDescription = ''
      }

      let addr
      for(let next of userInfo.address){
        addr = JSON.parse(next)
        if(addr.street == address){
          data.address = addr.street
          data.city = addr.city
          data.zipCode = addr.zipCode
          break;
        }
      }
      //Send info to the server
      //Send info to payment screen
      navigation.navigate("JobCreationPayment", { name: "JobCreationPayment" , data: data, userInfo: userInfo});
  }
    
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
                textStyle={{fontFamily: "Montserrat-Bold"}}
                placeholder="Address"
                listMode="SCROLLVIEW"
                open={open}
                value={address}
                items={addressList}
                setOpen={setOpen}
                setValue={setAddress}
                setItems={setAddressList}
                onOpen={() => setAddressError('')}
                onChangeValue={(value) => value == -1 ? navigation.navigate('Account', {name: 'Account'}): null}
              />
              {addressError ? ( <Text style={commonStyles.errorMsg}>{addressError}</Text> ) : ( <></> )}

              {/* duration */}
              <View style = {styles.durationStyle}>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 17}}>Duration in hours</Text>
                <NumericInput inputStyle={{backgroundColor: 'white', borderRadius: 5}} rounded value={duration} minValue={4} maxValue={8} type='up-down' onChange={value => setDuration(value)} />
              </View>

              {/* date of job */}
              <View style={styles.field}>
                <View>
                  <View>
                    {/* Date */}
                    <TouchableOpacity
                      onPress={showDatepicker}
                      style={[ commonStyles.inputBorder, { flexDirection: "row", marginVertical: 5 },]}
                    >
                      <FontAwesome name="calendar" size={20} style={commonStyles.icon}/>
                      <TextInput style={[styles.input, { color: "black" }]} editable={false} value={
                          dateSelected ? "Date of Request: " + date.toLocaleDateString() : "Date of Request"}
                      ></TextInput>
                    </TouchableOpacity>
                    {/* Time */}
                    <TouchableOpacity
                      onPress={showTimepicker}
                      style={[ commonStyles.inputBorder, { flexDirection: "row", marginVertical: 5 },]}
                    >
                      <Ionicons name='time' size={20} style={commonStyles.icon}/>
                      <TextInput style={[styles.input, { color: "black" }]} editable={false} value={
                          dateSelected ? "Time of Request: " + get12HourTime() : "Time of Request"}
                      ></TextInput>
                    </TouchableOpacity>
                  </View>
                  {show && (
                    <DateTimePicker
                      value={date}
                      onChange={onChange}
                      mode={mode}
                      is24Hour={false}
                      minimumDate={dateOfToday}
                      onTouchEnd={canceDate}
                      // onTouchCancel={canceDate}
                    />
                  )}
                </View>
                {dateError ? (
                  <Text style={commonStyles.errorMsg}>{dateError}</Text>) : ( <></> )}
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
    marginTop: 20,
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
    fontFamily: "Montserrat-Bold"
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
  durationStyle: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",

  }
});

export default JobCreation1;
