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
    width: 350,
    height: 350
  },
  errorMsg: {
    color: 'red',
    alignSelf: 'stretch',
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  icon:{
    borderRightWidth: 2,
    padding: 5,
    marginRight: 5,
    alignSelf: 'center'  
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    textAlign: "center",
  },
  outerContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 30,
  },
  inputBox: {
    width: 300,
    height: 40,
    fontSize: 20,
  },
  buttonStyle: {
    justifyContent: "center",
    width: 150,
    height: 50,
    backgroundColor: "black",
    borderRadius: 10,
  },
});

export const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};