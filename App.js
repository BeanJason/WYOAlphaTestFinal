//OTHER FILES
import Spinner from "./common/components/Spinner"
import { Store } from "./redux/store";
import awsconfig from "./src/aws-exports"

//LIBRARY IMPORTS
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import {Amplify, Auth} from "aws-amplify"
import { checkCredentials } from "./credentials";
import { changeUserStatus } from "./redux/authReducer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import { Asset } from "expo-asset"
import AppLoading from "expo-app-loading"

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
import UserHome from "./screens/user/UserHome";
import UserAccount from "./screens/user/userAccount/UserAccount"
import EditAccountUser2 from "./screens/user/userAccount/EditAccountUser2"
import EditAccountUser1 from "./screens/user/userAccount/EditAccountUser1"
import JobCreation1 from "./screens/user/JobCreation1"
import JobCreation2 from "./screens/user/JobCreation2"
import JobInfo from "./screens/user/JobInfo"
import JobHistory from "./screens/user/JobHistory"
import { config } from "./common/styles";

//CONFIGURE AMPLIFY
Amplify.configure(awsconfig);
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  //Load custom fonts
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Italic": require("./assets/fonts/Montserrat-Italic.ttf"),
  })

  //Load all assets
  const loadAssetsAsync = async () => {
    const imageAssets = await cacheImages([
      require('./assets/wyo_background.png'),
      require('./assets/Logo.png'),
    ]);

    return [imageAssets]
  }

  //Load all images
  let cacheImages = async (images) => {
    const cacheImages = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    })
    return cacheImages
  }


  let loadAllResources = async () => {
    await loadAssetsAsync()
    setImagesLoaded(true)
  }

  useEffect(() => {
    loadAllResources();
  }, [])

  if(!imagesLoaded || !fontsLoaded){
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
  const {loggedIn} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
 

  const checkLoggedIn = async () => {
    //TODO CHECK IF LOGGED IN
    const {authUser, userInfo} = await checkCredentials();
    if(authUser && userInfo){
      dispatch(changeUserStatus({authUser, userInfo}))
    }
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
      {loggedIn === false ? <GuestNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
};

//NOT LOGGED IN USER
const GuestNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{transitionSpec:{open: config, close: config}}}>
      <Stack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen}/>
      <Stack.Screen options={{ headerShown: false }} name="ForgotPassword1" component={ForgotPassword1}/>
      <Stack.Screen options={{ headerShown: false }} name="ForgotPassword2" component={ForgotPassword2}/>
      <Stack.Screen options={{title: 'User Registration'}} name="UserRegistration" component={UserRegistration} />
      <Stack.Screen options={{title: 'Provider Registration'}} name="ProviderRegistration" component={ProviderRegistration} />
      <Stack.Screen options={{title: 'Registration'}} name="RegistrationScreen" component={RegistrationScreen} />
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      <Stack.Screen options={{title: 'About Users'}} name="AboutUsers" component={AboutUsers} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
      <Stack.Screen options={{ headerShown: false }} name="ConfirmEmail" component={ConfirmEmail}/>
    </Stack.Navigator>
  );
};

//LOGGED IN USER/PROVIDER
const AuthNavigation = () => {
  //get user to check if verified
  const {authUser} = useSelector((state) => state.auth);
  return(
  <Stack.Navigator screenOptions={{transitionSpec:{open: config, close: config}}}>
    {authUser['custom:type'] === 'Manager' ? (
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
    ): <>
      {authUser['custom:type']  === 'User' ? (
        <Stack.Screen options={{headerShown: false}} name="UserNavigation" component={UserNavigation}/>
      ) : (
        <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      )
      }
    </> 
    }
  </Stack.Navigator>
  )
};

//USER NAVIGATION
const UserNavigation = () => {
  return (
    <Tab.Navigator 
      initialRouteName="userHome"
      screenOptions={(route) => ({
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'grey',  
        tabBarLabelStyle: {paddingBottom: 10, fontSize: 15, fontFamily: 'Montserrat-Bold'},
        tabBarStyle:{padding: 10, height: 70},
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let name = route.route.name
          if (name === 'Home'){
            iconName = focused ? 'home' : 'home-outline'
          } else if (name === 'Create Job') {
            iconName = focused ? 'create' : 'create-outline'
          } else if (name === 'Job History') {
            iconName = focused ? 'time' : 'time-outline'
          } else if (name === 'Account') {
            iconName = focused ? 'person' : 'person-outline'
          }
          return (<Ionicons name={iconName} size={size} color={color} />)
        }
      })}
      >
      <Tab.Screen options={{headerShown: false}} name='Home' component={UserHomeTab}/>
      <Tab.Screen options={{headerShown: false}} name='Create Job' component={UserJobCreationTab}/>
      <Tab.Screen options={{headerShown: false}} name='Job History' component={UserHistoryTab}/>
      <Tab.Screen options={{headerShown: false}} name='Account' component={UserAccountTab}/>
    </Tab.Navigator> 
  )
}

const UserHomeTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false}} name='userHome' component={UserHome}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="JobInfo" component={JobInfo}/>
    </Stack.Navigator>
  )
}

const UserJobCreationTab = () => {
  return(
  <Stack.Navigator>
    <Stack.Screen options={{headerShown: false }} name="JobCreation1" component={JobCreation1}/>
    <Stack.Screen options={{ title: 'Create a Job' }} name="JobCreation2" component={JobCreation2}/>
  </Stack.Navigator>
  )
}

const UserHistoryTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false }} name="JobHistory" component={JobHistory}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="JobInfo" component={JobInfo}/>
    </Stack.Navigator>
  )
}

const UserAccountTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="UserAccount" component={UserAccount}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="EditAccountUser1" component={EditAccountUser1}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="EditAccountUser2" component={EditAccountUser2}/>
    </Stack.Navigator>
  )
}