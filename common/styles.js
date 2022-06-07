import { StyleSheet, Dimensions, StatusBar} from "react-native";

//Global styles to be used in multiple screens
export const commonStyles = StyleSheet.create({
  safeContainer:{
    flex:1,
    marginTop: StatusBar.currentHeight
  },
  inputBorder: {
    shadowColor: "black",
    shadowOffset: { width: 5, height: 5 },
    elevation: 3,
    shadowOpacity: 0.1,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  background: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height + 100,
    
  },
  logo: {
    width: "65%",
    resizeMode: "center",
    height: "65%",
  },
  errorMsg: {
    color: 'red',
    alignSelf: 'stretch',
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  colors:{
    primary: '#f54',
  },
  icon:{
    borderRightWidth: 2,
    padding: 5,
    marginRight: 5,
    alignSelf: 'center'  
  }

});