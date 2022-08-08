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
import {Amplify, DataStore, Hub } from "aws-amplify"
import {Provider as ProviderModel} from "./src/models"
import { checkCredentials, getProviderPicture } from "./credentials";
import { changeProviderPicture, changeUserStatus } from "./redux/authReducer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import { Asset } from "expo-asset"
import { LogBox, Platform } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import {STRIPE_KEY} from "@env"


//GUEST SCREENS
import RegistrationScreen from "./screens/account/RegistrationScreen";
import UserRegistration from "./screens/account/UserRegistration";
import ProviderRegistration from "./screens/account/ProviderRegistration";
import LoginScreen from "./screens/account/LoginScreen";
import AboutProviders from "./screens/aboutScreens/AboutProviders";
import AboutUs from "./screens/aboutScreens/AboutUs";
import AboutUsers from "./screens/aboutScreens/AboutUsers";
import ContactUs from "./screens/aboutScreens/ContactUs";
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
import UserReview from "./screens/user/UserReview";
//USER FUNCTIONS
import { resetState } from "./redux/jobsReducer";
import { checkUnverifiedJob } from "./common/functions";

//Provider Screens
import ProviderHome from "./screens/provider/ProviderHome";
import JobSearch from "./screens/provider/JobSearch";
import EditAccountProvider from "./screens/provider/providerAccount/EditAccountProvider";
import ProviderJobInfo from "./screens/provider/ProviderJobInfo";
import ProviderJobHistory from "./screens/provider/ProviderJobHistory";
import JobSignUp from "./screens/provider/JobSignUp";
import ServiceView from "./screens/provider/ServiceView";
import EditAddress from "./screens/provider/providerAccount/EditAddress";


//Manager Screens
import ManagerHome from "./screens/manager/ManagerHome";
import ManagerJobInfo from "./screens/manager/ManagerJobInfo";
import EmployeeMain from "./screens/manager/employee/EmployeeMain";
import EmployeeInfo from "./screens/manager/employee/EmployeeInfo";
import EmployeeJobs from "./screens/manager/employee/EmployeeJobs";
import NewApplicants from "./screens/manager/applicants/NewApplicants";
import ApplicantsInfo from "./screens/manager/applicants/ApplicantsInfo";
import EditAccountManager from "./screens/manager/EditAccountManager";
import EmployeeReviews from "./screens/manager/employee/EmployeeReviews";
import CreateManager from "./screens/manager/CreateManager";


//Common screens
import ChangePassword from "./screens/commonScreens/ChangePassword";
import VerifyAccount from "./screens/commonScreens/VerifyAccount";


import { config } from "./common/styles";
import * as TaskManager from "expo-task-manager"
import { updateLocation } from "./redux/jobsProviderReducer";
import Terms from "./screens/aboutScreens/Terms";

//BACKGROUND TASKS
//Location
TaskManager.defineTask('BACKGROUND_LOCATION', async ({data, error}) => {
  console.log('task is setup');
    if (error) {
        console.error(error);
        return;
      }
      if(data){
        const {locations} = data
        const location = locations[0]
        let state = Store.getState()
      
        if(state.auth.loggedIn && location){
            console.log('updating location');
            if(state.auth.userInfo){
              let original = await DataStore.query(ProviderModel, state.auth.userInfo.id)
              try {
                  await DataStore.save(ProviderModel.copyOf(original, (updated) => {
                  updated.currentLocation = JSON.stringify({latitude: location.coords.latitude, longitude: location.coords.longitude, dateUpdated: new Date()})
                }))
              } catch (error) {
                console.log(error);
              }
            }
            Store.dispatch(updateLocation(location.coords))
        }
      }
})

let height = 70;
if(Platform.OS == 'ios'){
  height = 100;
}




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
    await DataStore.stop()
    await loadAssetsAsync()
    setImagesLoaded(true)
    loadDataStore()
  }

  useEffect(() => { 
    //ignore warning
    LogBox.ignoreLogs(['new NativeEventEmitter'])
    LogBox.ignoreAllLogs()
    loadAllResources();
  }, [])

  if(!imagesLoaded || !fontsLoaded || !dataStoreLoaded){
    return null;
  }
  
  return (
    <Provider store={Store}>
      <StripeProvider publishableKey = {STRIPE_KEY} >
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
      if(userInfo == 'invalid'){
        console.log('account is banned');
      }
      else{
        dispatch(resetState())
        dispatch(changeUserStatus({authUser, userInfo}))
        if(authUser['custom:type'] == 'Provider'){
          let pic = await getProviderPicture(userInfo.profilePictureURL)
          if(pic != "" && pic != null){
            dispatch(changeProviderPicture(pic))
          }
        }
      }
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
      <Stack.Screen options={{title: 'Terms'}} name="Terms" component={Terms} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
      <Stack.Screen options={{ headerShown: false }} name="ConfirmEmail" component={ConfirmEmail}/>
      <Stack.Screen options={{title: 'Contact Us'}} name="ContactUs" component={ContactUs} />
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
      <Stack.Screen options={{headerShown: false}} name="ManagerNavigation" component={ManagerNavigation} />
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
        tabBarStyle:{padding: 10, height: height},
        tabBarShowLabel: true,
        
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
    <Stack.Screen options={{title: 'Terms'}} name="Terms" component={Terms} />
  </Stack.Navigator>
  )
}

const UserHistoryTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false }} name="UserJobHistory" component={UserJobHistory}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="UserJobInfo" component={UserJobInfo}/>
      <Stack.Screen options={{ title: 'Write a Review' }} name="UserReview" component={UserReview}/>
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
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      <Stack.Screen options={{title: 'About Users'}} name="AboutUsers" component={AboutUsers} />
      <Stack.Screen options={{title: 'Terms'}} name="Terms" component={Terms} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
      <Stack.Screen options={{title: 'Contact Us'}} name="ContactUs" component={ContactUs} />
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
        tabBarStyle:{padding: 10, height: height},
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
      <Stack.Screen options={{ title: 'Job Information' }} name="ProviderJobInfo" component={ProviderJobInfo}/>
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
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      <Stack.Screen options={{title: 'About Users'}} name="AboutUsers" component={AboutUsers} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
      <Stack.Screen options={{title: 'Contact Us'}} name="ContactUs" component={ContactUs} />
    </Stack.Navigator>
  )
}






//Manager NAVIGATION
const ManagerNavigation = () => {
  return (
    <Tab.Navigator 
      initialRouteName="ManagerHome"
      screenOptions={(route) => ({
        unmountOnBlur: true,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'grey',  
        tabBarLabelStyle: {paddingBottom: 5, fontSize: 15, fontFamily: 'Montserrat-Bold'},
        tabBarStyle:{padding: 10, height: height},
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let name = route.route.name
          if (name === 'Home'){
            iconName = focused ? 'home' : 'home-outline'
          } else if (name === 'Employees') {
            iconName = focused ? 'people' : 'people-outline'
          } else if (name === 'Applicants') {
            iconName = focused ? 'add-circle' : 'add-circle-outline'
          } else if (name === 'Account') {
            iconName = focused ? 'settings' : 'settings-outline'
          }
          return (<Ionicons name={iconName} size={size} color={color} />)
        }
      })}
      >
      <Tab.Screen options={{headerShown: false}} name='Home' component={ManagerHomeTab}/>
      <Tab.Screen options={{headerShown: false}} name='Employees' component={EmployeeTab}/>
      <Tab.Screen options={{headerShown: false}} name='Applicants' component={NewApplicantsTab}/>
      <Tab.Screen options={{headerShown: false}} name='Account' component={ManagerAccountTab}/>
    </Tab.Navigator> 
  )
}


const ManagerHomeTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{headerShown: false}} name='ManagerHome' component={ManagerHome}/>
      <Stack.Screen options={{ title: 'Job Information' }} name="ManagerJobInfo" component={ManagerJobInfo}/>
    </Stack.Navigator>
  )
}

const EmployeeTab = () => {
  return(
  <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
    <Stack.Screen options={{headerShown: false }} name="EmployeeMain" component={EmployeeMain}/>
    <Stack.Screen options={{title: 'Employee Information' }} name="EmployeeInfo" component={EmployeeInfo}/>
    <Stack.Screen options={{title: 'Employee Jobs' }} name="EmployeeJobs" component={EmployeeJobs}/>
    <Stack.Screen options={{ title: 'Job Information' }} name="ManagerJobInfo" component={ManagerJobInfo}/>
    <Stack.Screen options={{ title: 'Employee Reviews' }} name="EmployeeReviews" component={EmployeeReviews}/>
  </Stack.Navigator>
  )
}

const NewApplicantsTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{headerShown: false }} name="NewApplicants" component={NewApplicants}/>
      <Stack.Screen options={{title: 'Applicant Information' }} name="ApplicantsInfo" component={ApplicantsInfo}/>
    </Stack.Navigator>
  )
}

const ManagerAccountTab = () => {
  return (
    <Stack.Navigator screenOptions={{unmountOnBlur: true}}>
      <Stack.Screen options={{ headerShown: false }} name="MyAccount" component={MyAccount}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="VerifyAccount" component={VerifyAccount}/>
      <Stack.Screen options={{ title: 'Change Password' }} name="ChangePassword" component={ChangePassword}/>
      <Stack.Screen options={{ title: 'Create Manager' }} name="CreateManager" component={CreateManager}/>
      <Stack.Screen options={{ title: 'Edit Account Info' }} name="EditAccountManager" component={EditAccountManager}/>
      <Stack.Screen options={{title: 'About Us'}} name="AboutUs" component={AboutUs} />
      <Stack.Screen options={{title: 'Terms'}} name="Terms" component={Terms} />
      <Stack.Screen options={{title: 'About Users'}} name="AboutUsers" component={AboutUsers} />
      <Stack.Screen options={{title: 'About Providers'}} name="AboutProviders" component={AboutProviders} />
      <Stack.Screen options={{title: 'Contact Us'}} name="ContactUs" component={ContactUs} />
    </Stack.Navigator>
  )
}

