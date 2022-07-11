//OTHER FILES
import Spinner from "./common/components/Spinner"
import Store  from "./redux/store";
import awsconfig from "./src/aws-exports"

//LIBRARY IMPORTS
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, useDispatch, Provider } from "react-redux";
import {Amplify, Auth, DataStore, Hub, nav} from "aws-amplify"
import { checkCredentials, stripeKey } from "./credentials";
import { changeUserStatus, logout, changeExpoToken } from "./redux/authReducer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import { Asset } from "expo-asset"
import { LogBox } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';


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
import MyAccount from "./screens/commonScreens/MyAccount"
import EditAccountUser from "./screens/user/userAccount/EditAccountUser"
import AddAddress from "./screens/user/userAccount/AddAddress"
import JobCreation1 from "./screens/user/JobCreation1"
import JobCreationPayment from "./screens/user/JobCreationPayment"
import UserJobInfo from "./screens/user/UserJobInfo"
import UserJobHistory from "./screens/user/UserJobHistory"

//Provider Screens
import ProviderHome from "./screens/provider/ProviderHome";
import JobSearch from "./screens/provider/JobSearch";
import EditAccountProvider from "./screens/provider/providerAccount/EditAccountProvider";
import ProviderJobInfo from "./screens/provider/ProviderJobInfo";
import ProviderJobHistory from "./screens/provider/ProviderJobHistory";
import JobSignUp from "./screens/provider/JobSignUp";
import ServiceView from "./screens/provider/ServiceView";

//Common screens
import ChangePassword from "./screens/commonScreens/ChangePassword";
import VerifyAccount from "./screens/commonScreens/VerifyAccount";


import { config } from "./common/styles";
import { getProvider, getUser } from "./testData";
import { resetState, storeNewJobID } from "./redux/jobsReducer";
import { checkUnverifiedJob } from "./common/functions";
import EditAddress from "./screens/provider/providerAccount/EditAddress";
import notifications from "./notifications"
import * as TaskManager from "expo-task-manager"
import * as Notifications from "expo-notifications"


const NEW_PROVIDER_TASK = "background-provider-task"
//when the app is in the background and you receieve a notification
console.log('setting task');
TaskManager.defineTask(NEW_PROVIDER_TASK, async ({data, error}) => {
  console.log('background notification');
  if(error){
    console.log(error);
    return;
  }
  console.log(data);
  if(data.request.content.title == 'New Provider'){
    let data = data.request.content.data
    try {
      let original = await DataStore.query(Job, data.jobID)
      let ids = await createProviderReminder(original)
      await DataStore.save(Job.copyOf(original, (updated) => {
        updated.providerNotificationID.push(ids[0])
        updated.providerNotificationID.push(ids[1])
      }))
    } catch (error) {
      console.log(error);
    }
  }
})




//CONFIGURE AMPLIFY
Amplify.configure(awsconfig);
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [dataStoreLoaded, setDataStoreLoaded] = useState(false);

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

  const loadDataStore = async () => {
    Hub.listen("datastore", async hubData => {
      const {event, data} = hubData.payload
      if(event === 'ready'){
        console.log('datastore is ready!');
        setDataStoreLoaded(true)
      }
    })
    await DataStore.start()
  }

  let loadAllResources = async () => {
    await DataStore.clear()
    await loadAssetsAsync()
    setImagesLoaded(true)
    await Notifications.registerTaskAsync(NEW_PROVIDER_TASK)
    loadDataStore()
  }

  useEffect(() => { 
    LogBox.ignoreLogs(['new NativeEventEmitter'])
    loadAllResources();
  }, [])

  if(!imagesLoaded || !fontsLoaded || !dataStoreLoaded){
    return null;
  }
  
  return (
    <Provider store={Store}>
      <StripeProvider publishableKey = "pk_test_51LAbv7GUC6WuR4axP3o28XT3NNuJW1Reiy10HWN33J35I6hAaEEs18ZVnmUVbCSwmv4sLic0KdI6ZnFnjkl1B5yW00IAMz9BzM" >
        <RootNavigation />
      </StripeProvider>
      
    </Provider>
  );
}

//NAVIGATION START
const RootNavigation = () => {
  const [loading, setLoading] = useState(true);
  const {loggedIn} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
 

  const checkLoggedIn = async () => {
    
    const {authUser, userInfo} = await checkCredentials();
    
    //TESTING
    // const {authUser, userInfo} = getUser()
    // const {authUser, userInfo} = getProvider()
    
    if(authUser && userInfo){
      dispatch(resetState())
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
      {loggedIn === true ? <AuthNavigation /> : <GuestNavigation />}
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
      <Stack.Screen options={{ headerShown: false }} name="UserRegistration" component={UserRegistration} />
      <Stack.Screen options={{ headerShown: false }} name="ProviderRegistration" component={ProviderRegistration} />
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
        <Stack.Screen options={{headerShown: false}} name="ProviderNavigation" component={ProviderNavigation}/>
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
        unmountOnBlur: true,
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
          } else if (name === 'History') {
            iconName = focused ? 'time' : 'time-outline'
          } else if (name === 'Account') {
            iconName = focused ? 'person' : 'person-outline'
          }
          return (<Ionicons name={iconName} size={size} color={color} />)
        }
      })}
      >
      <Tab.Screen options={{headerShown: false}} name='Home' component={UserHomeTab}/>
      <Tab.Screen options={{headerShown: false}} 
      listeners={({route}) => ({
        blur: async (event) => {
          if(route.state){
            if(route.state.routes[1].name == 'JobCreationPayment'){
              await checkUnverifiedJob(route.state.routes[1].params.jobInfo, route.state.routes[1].params.code)
            }
          }
        }
      }) } 
      name='Create Job' component={UserJobCreationTab}/>
      <Tab.Screen options={{headerShown: false}} name='History' component={UserHistoryTab}/>
      <Tab.Screen options={{headerShown: false}} name='Account' component={UserAccountTab}/>
    </Tab.Navigator> 
  )
}

const UserHomeTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{headerShown: false}} name='UserHome' component={UserHome}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="UserJobInfo" component={UserJobInfo}/>
    </Stack.Navigator>
  )
}

const UserJobCreationTab = () => {
  return(
  <Stack.Navigator>
    <Stack.Screen options={{headerShown: false }} name="JobCreation1" component={JobCreation1}/>
    <Stack.Screen options={{ headerShown: false, headerLeft: null}} name="JobCreationPayment" component={JobCreationPayment}/>
  </Stack.Navigator>
  )
}

const UserHistoryTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false }} name="UserJobHistory" component={UserJobHistory}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="UserJobInfo" component={UserJobInfo}/>
    </Stack.Navigator>
  )
}

const UserAccountTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{ headerShown: false }} name="MyAccount" component={MyAccount}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="VerifyAccount" component={VerifyAccount}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="EditAccountUser" component={EditAccountUser}/>
      <Stack.Screen options={{ title: 'Change Password' }} name="ChangePassword" component={ChangePassword}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="AddAddress" component={AddAddress}/>
    </Stack.Navigator>
  )
}

//Provider NAVIGATION
const ProviderNavigation = () => {
  return (
    <Tab.Navigator 
      initialRouteName="ProviderHome"
      screenOptions={(route) => ({
        unmountOnBlur: true,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'grey',  
        tabBarLabelStyle: {paddingBottom: 10, fontSize: 15, fontFamily: 'Montserrat-Bold'},
        tabBarStyle:{padding: 10, height: 70},
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let name = route.route.name
          if (name === 'Home'){
            iconName = focused ? 'home' : 'home-outline'
          } else if (name === 'Job Search') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (name === 'History') {
            iconName = focused ? 'time' : 'time-outline'
          } else if (name === 'Account') {
            iconName = focused ? 'person' : 'person-outline'
          }
          return (<Ionicons name={iconName} size={size} color={color} />)
        }
      })}
      >
      <Tab.Screen options={{headerShown: false}} name='Home' component={ProviderHomeTab}/>
      <Tab.Screen options={{headerShown: false}} name='Job Search' component={ProviderJobSearchTab}/>
      <Tab.Screen options={{headerShown: false}} name='History' component={ProviderHistoryTab}/>
      <Tab.Screen options={{headerShown: false}} name='Account' component={ProviderAccountTab}/>
    </Tab.Navigator> 
  )
}

const ProviderHomeTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{headerShown: false}} name='ProviderHome' component={ProviderHome}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="ServiceView" component={ServiceView}/>
    </Stack.Navigator>
  )
}

const ProviderJobSearchTab = () => {
  return(
  <Stack.Navigator>
    <Stack.Screen options={{headerShown: false }} name="JobSearch" component={JobSearch}/>
    <Stack.Screen options={{title: 'Job Sign Up' }} name="JobSignUp" component={JobSignUp}/>
  </Stack.Navigator>
  )
}

const ProviderHistoryTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false }} name="ProviderJobHistory" component={ProviderJobHistory}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="ProviderJobInfo" component={ProviderJobInfo}/>
    </Stack.Navigator>
  )
}

const ProviderAccountTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{ headerShown: false }} name="MyAccount" component={MyAccount}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="VerifyAccount" component={VerifyAccount}/>
      <Stack.Screen options={{ title: 'Change Password' }} name="ChangePassword" component={ChangePassword}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="EditAccountProvider" component={EditAccountProvider}/>
      <Stack.Screen options={{ title: 'Edit Address' }} name="EditAddress" component={EditAddress}/>
    </Stack.Navigator>
  )
}

