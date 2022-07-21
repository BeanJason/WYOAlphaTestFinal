import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Controller } from "react-hook-form";
import { commonStyles } from "../styles";
import { FontAwesome, MaterialIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import { useState } from "react";

//Creates a text input box with parameters for the name, placeholder, validation, errors, and style
export default function UserInput({control, name, rules = {}, placeholder, style, secureTextEntry, multiline, icon, location, onKeyPress, keyboardType = 'default', maxLength}) {

  const [isSecureEntry, setIsSecureEntry]= useState(true);

  const renderIcon = () => {
    if (location == "FontAwesome") {
      return (
        <FontAwesome name={icon} size={24} style={commonStyles.icon}/>
      );
    }
    else if(location == 'MaterialIcons'){
        return <MaterialIcons name={icon} size={24} style={commonStyles.icon} />
    }
    else if(location == 'AntDesign'){
      return <AntDesign name={icon} size={24} style={commonStyles.icon} />
    }
  }

  const renderShowOrHidePass = () => {
    return (
      <TouchableOpacity style = {{position: 'absolute', alignSelf: 'center', right: 20 }}
        onPress={() => {
          setIsSecureEntry((prev) => !prev);
        }}>
          <Text> {isSecureEntry ? 
          <Ionicons name='eye' size={24} style={commonStyles.icon}/> : 
          <Ionicons name='eye-off' size={24} style={commonStyles.icon}/>
          }</Text>
      </TouchableOpacity>
    )
  }

  //Add dashes to phone number
  let [phone, setPhone] = useState('')
  const formatPhoneNumber = (event) => {
    if(event.nativeEvent.key != ' ' && event.nativeEvent.key != '-' && event.nativeEvent.key != ','&& event.nativeEvent.key != '.'){
      if(event.nativeEvent.key == 'Backspace'){
        if(phone.length == 5 || phone.length == 9){
          setPhone(phone.slice(0, -2))
        }
        else{
          setPhone(phone.slice(0, -1))
        }
      }
      if(phone.length != 12 && event.nativeEvent.key != 'Backspace'){
        if(phone.length == 3 || phone.length == 7){
          setPhone(phone+'-'+event.nativeEvent.key)
        }
        else{
          setPhone(phone+event.nativeEvent.key)
        }
      }
    }
  }


  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[commonStyles.inputBorder, { borderColor: error ? "red" : "white", marginVertical: 5, flexDirection: 'row'}]}
          >
            {icon ? ( renderIcon()) : ( <></> )}
            <TextInput
              style={[style]}
              autoCorrect={false}
              value={onKeyPress ? (phone): value}
              keyboardType={keyboardType}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry = {secureTextEntry ? (isSecureEntry): false}
              autoCapitalize = {secureTextEntry ? 'none': 'sentences'}
              multiline={multiline}
              maxLength={maxLength ? (maxLength): 100}
              onKeyPress={onKeyPress ? ((event) => formatPhoneNumber(event)): null}
            />
            {secureTextEntry ? (renderShowOrHidePass()): (<></>)}
          </View>
          {error && (
            <View style={{alignSelf: 'stretch'}}>
              <Text style={commonStyles.errorMsg}>
                {error.message || "Error"}
              </Text>
            </View>
          )}
        </>
      )}
    />
  );
}