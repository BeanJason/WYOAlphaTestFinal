import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Controller } from "react-hook-form";
import { commonStyles } from "../styles";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

//Creates a text input box with parameters for the name, placeholder, validation, errors, and style
export default function UserInput({control, name, rules = {}, placeholder, style, secureTextEntry, multiline, icon, location }) {

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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry = {secureTextEntry ? (isSecureEntry): false}
              multiline={multiline}
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