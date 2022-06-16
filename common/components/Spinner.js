import { View } from "react-native"
import {ActivityIndicator} from "react-native"

//Show a spinner loading on a screen
const Spinner = (color) => {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color={color.color} />
    </View>
  )
}

export default Spinner