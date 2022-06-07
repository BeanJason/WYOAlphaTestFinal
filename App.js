//SCREENS
import RegistrationScreen from "./screens/account/RegistrationScreen";
import UserRegistration from "./screens/account/UserRegistration";
import ProviderRegistration from "./screens/account/ProviderRegistration";
import LoginScreen from "./screens/account/LoginScreen";
import AboutProviders from "./screens/aboutScreens/AboutProviders";
import AboutUs from "./screens/aboutScreens/AboutUs";
import AboutUsers from "./screens/aboutScreens/AboutUsers";
import ForgotPassword1 from "./screens/account/forgotPassword/ForgotPassword1";
import ForgotPassword2 from "./screens/account/forgotPassword/ForgotPassword2";

//USER SCREENS
import ConfirmEmail from "./screens/account/ConfirmEmail";


//OTHER FILES
import Spinner from "./common/components/Spinner"
import { Store } from "./redux/store";
import awsconfig from "./src/aws-exports"

//LIBRARY IMPORTS
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import {Amplify} from "aws-amplify"



Amplify.configure(awsconfig)
const Stack = createNativeStackNavigator();

export default function App() {
  // Load all custom fonts
  let [loaded] = useFonts({
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Italic": require("./assets/fonts/Montserrat-Italic.ttf"),
  });
  if (!loaded) {
    return null;
  }

  return (
    <Provider store={Store}>
      <RootNavigation/>
    </Provider>
  );
}

//NAVIGATION START
const RootNavigation = () => {
  const [loading, setLoading] = useState(true);
  const loggedIn = false
 

  const checkLoggedIn = async () => {
    //TODO CHECK IF LOGGED IN
    setLoading(false)
  }

  useEffect(() => {
    checkLoggedIn()
  }, [])

  //loading screen while waiting for token retrieval
  if (loading) {
    return (
      <Spinner />
    )
  }

  return (
    <NavigationContainer>
      {loggedIn === false ? <GuestNavigation /> : <GuestNavigation />}
    </NavigationContainer>
  );
};

//NOT LOGGED IN USER
const GuestNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen}/>
      <Stack.Screen options={{ headerShown: false }} name="ForgotPassword1" component={ForgotPassword1}/>
      <Stack.Screen options={{ headerShown: false }} name="ForgotPassword2" component={ForgotPassword2}/>
      <Stack.Screen options={{title: 'User Registration'}} name="UserRegistration" component={UserRegistration} />
      <Stack.Screen options={{title: 'Provider Registration'}} name="ProviderRegistration" component={ProviderRegistration} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      <Stack.Screen options={{title: 'About Users'}} name="AboutUsers" component={AboutUsers} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
    </Stack.Navigator>
  );
};