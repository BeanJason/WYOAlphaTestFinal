import {
  StyleSheet,
  TextInput,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Modal
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
import CurrencyInput from 'react-native-currency-input';

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

  //price
  const [price, setPrice] = useState()
  const [tip, setTip] = useState(0)
  const [priceText, setPriceText] = useState()
  const [tipText, setTipText] = useState()
  const [total, setTotal] = useState(0)
  const [totalText, setTotalText] = useState()
  const [showModal, setShowModal] = useState(false)
  const [otherTip, setOtherTip] = useState()
  //Used to track if tip button has been pressed and change color if true
  const [isPress, setIsPress] = useState();

  useEffect(() => {
    setPrice(5000)
    let nextDay = new Date()
    nextDay.setDate(nextDay.getDate() + 2)
    setDateOfToday(nextDay)

    let items = []
    let addr
    for(let next of userInfo.address){
      addr = JSON.parse(next)
      items.push({
        label: `${addr.street} ${addr.city} ${addr.zipCode}`,
        value: `${addr.street} ${addr.city} ${addr.zipCode}`
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
  

  //Prices
  //duration change
  const onDurationChange = (value) => {
    if(value >= 4 && value <= 8){
      setDuration(value)
      switch(value){
        case 4:
          setPrice(5000)
          break;
        case 5:
          setPrice(6250)
          break;
        case 6:
          setPrice(7500)
          break;
        case 7:
          setPrice(8750)
          break;
        case 8:
          setPrice(10000)
          break;
      }
    }
    if(isPress != ''){
      setIsPress('')
      setTip(0)
      setOtherTip(0)
    }
  }
  const onTipChange = (value, priceChange = false) => {
    let result = price
    switch (value){
      default:
        if(otherTip){
          setTip(otherTip * 100)
        }
        setIsPress('-1')
        setShowModal(false)
        break;
      case 10:
        if(isPress == '10%' && !priceChange){
          setTip(0)
          setIsPress('')
        }
        else{
          result = 0.10 * result
          setIsPress('10%')
          setTip(result)
        }
        break;
      case 15:
        if(isPress == '15%' && !priceChange){
          setTip(0)
          setIsPress('')
        }else{
          result = 0.15 * result
          setIsPress('15%')
          setTip(result)
        }
        break;
      case 20:
        if(isPress == '20%' && !priceChange){
          setTip(0)
          setIsPress('')
        }else{
          result = 0.20 * result
          setIsPress('20%')
          setTip(result)
        }
        break;
    }
  }
  useEffect(() => {
    convertMoneyToText('price')
  }, [price])
  useEffect(() => {
    convertMoneyToText('tip')
  }, [tip])
  const convertMoneyToText = (type) => {
    if(type == 'tip'){
      let result = tip / 100
      setTipText(result.toFixed(2))
    }
    else{
      let result = price / 100
      setPriceText(result.toFixed(2))
    }
  }
  useEffect(() => {
    setTotal(price + tip + 250)
    let result = (price + tip + 250) / 100
    setTotalText(result.toFixed(2))
  }, [tip, price])



  //Submit the user input
  const submitForm = async (data) => {
    if(dateSelected == false){
      setDateError('A requested date and time must be chosen')
    }
    if(address == null){
      setAddressError('Address is required')
    }
    //Success
    if(address != null && dateSelected != false){
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
        if(`${addr.street} ${addr.city} ${addr.zipCode}` == address){
          data.address = addr.street
          data.city = addr.city
          data.zipCode = addr.zipCode
          data.lat = addr.lat.toString(),
          data.lng = addr.lng.toString()
          break;
        }
      }
      data.price = price + 250
      data.tip = tip
      data.total = total
      //Send info to the server
      //Send info to payment screen
      navigation.navigate("JobCreationPayment", { name: "JobCreationPayment" , data: data, userInfo: userInfo});
  }
    
  };


  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background, {height: 1100}]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>

        {/* Modal for tips */}
        <Modal
          visible={showModal}
          transparent
          animationType='slide'
          hardwareAccelerated
          >
          <View style={[styles.centeredView]}>
            <View style={ styles.warningModal}>
              <Text style={styles.modalTitle}>Other Tip Amount</Text>
              <CurrencyInput
                placeholder="$ Amount"
                keyboardType="numeric"
                value={otherTip}
                onChangeValue={setOtherTip}
                prefix='$'
                separator="."
                precision={2}
                style={[styles.tipInput, commonStyles.inputBorder, {alignSelf: 'center'}]}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={[styles.tipButton, {alignSelf: 'flex-end'}]}
                  >
                  <Text style={styles.tipText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => onTipChange(-1)}
                  style={[styles.tipButton, {alignSelf: 'flex-end'}]}
                  >
                  <Text style={styles.tipText}>Done</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        </Modal>


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
                    />
                  )}
                </View>
                {dateError ? (
                  <Text style={commonStyles.errorMsg}>{dateError}</Text>) : ( <></> )}
              </View>
            </View>

            {/* duration */}
            <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 17, marginTop: 20}}>Duration in hours: 4-8</Text>
            <View style={[styles.field, {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}]}>
              <View style = {styles.durationStyle}>
                <NumericInput inputStyle={{backgroundColor: 'white', borderRadius: 5}} rounded value={duration} minValue={4} maxValue={8} type='up-down' onChange={(value) => onDurationChange(value)} />
              </View>
              <View style={styles.priceStyle}>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18, padding: 5, marginLeft: 10}}>Cost:</Text>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18, }}>${priceText}</Text>
              </View>
            </View>

            {/* Tips */}
            <View style = {styles.field}>
              <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 17, textAlign: 'center'}}>Would you like to give a tip to your provider?</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <TouchableOpacity 
                onPress={() => onTipChange(10)}
                style= {[isPress == '10%' ? styles.btnPressed : styles.tipButton]}
                >
                <Text style={[isPress == '10%' ? styles.tipTextPressed : styles.tipText]}>10%</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                onPress={() => onTipChange(15)}
                style={[isPress == '15%' ? styles.btnPressed : styles.tipButton]}
                >
                <Text style={[isPress == '15%' ? styles.tipTextPressed : styles.tipText]}>15%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => onTipChange(20)}
                style = {[isPress == '20%' ? styles.btnPressed : styles.tipButton]}
                >
                <Text style={[isPress == '20%' ? styles.tipTextPressed : styles.tipText]}>20%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => { setShowModal(true)} }
                style={[isPress == '-1' ? styles.btnPressed : styles.tipButton]}
                >
                <Text style={[isPress == '-1' ? styles.tipTextPressed : styles.tipText]}>Other</Text>
                </TouchableOpacity>

              </View>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18, textAlign: 'right' }}>Tip: </Text>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18, textAlign: 'right' }}>${tipText}</Text>
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
            <View style={{flexDirection: 'row', alignSelf: 'flex-end', marginTop: 5}}>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 20, textAlign: 'right' }}>Service Fee: </Text>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 20, textAlign: 'right' }}>$2.50</Text>
            </View>
            <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 24, textAlign: 'right' }}>Total: </Text>
                <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 24, textAlign: 'right' }}>${totalText}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={[styles.button, {width: 310, height: 60}]}
            >
              <Text style={[styles.btnText, {textAlign: 'center'}]}>Proceed to Checkout</Text>
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
  priceStyle:{
    alignItems: "center",
    flexDirection: 'row',
    marginTop: 10
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
  },
  durationStyle: {
    marginTop: 10,
  },
  tipButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnPressed: {
     justifyContent: "center",
     alignItems: "center",
     width: 80,
     height: 40,
     backgroundColor: "yellow",
     borderRadius: 10,
     marginVertical: 10,
     marginLeft: 25,
     marginRight: 25,
  },
  tipText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
  },
  tipTextPressed: {
    color: "black",
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090'
  },
  warningModal: {
    width: 350,
    height: 150,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    alignSelf: 'center'
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: 'center',
  },
  tipInput: {
    width: 200,
    height: 40,
    fontSize: 16,
    fontFamily: "Montserrat-Bold"
  },
});

export default JobCreation1;
