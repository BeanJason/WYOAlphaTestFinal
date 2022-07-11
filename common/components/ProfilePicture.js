import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ActivityIndicator, ImageBackground } from "react-native"


//Show a spinner loading on a screen
const ProfilePicture = ({imageUrl, name, size, loading = false}) => {
  const [image, setImage] = useState(imageUrl)
  const [initials, setInitials] = useState()

  useEffect(() => {
    setImage(imageUrl)
    let arr = name.split(' ')
    setInitials(arr[0].slice(0,1) + arr[1].slice(0,1))
  }, [imageUrl])
  
  return (
   <View>
      {imageUrl ? (
        <View style={{justifyContent: 'center', width: size, height: size}}>
          <ImageBackground
            style={{width: size, height: size}} 
            source={{uri: image}}
            imageStyle={{borderRadius: 200 / 2}}
            >
              {loading ? <ActivityIndicator size="small" color={'black'}/> : <></>}
            </ImageBackground>
        </View>
      ):(
        <View style={[styles.container, {width:size, height:size, backgroundColor: 'orange', justifyContent: 'center'}]}>
          <Text style={{fontFamily: 'Montserrat-Bold', fontSize: size / 2, textAlign: 'center'}}>{initials}</Text>
          <View>
            {loading ? <ActivityIndicator size="small" color={'black'}/> : <></>}
          </View>
        </View>
      )}
   </View>
    
  )
}

const styles = StyleSheet.create({
  container:{
    borderRadius: 200 / 2,
    borderWidth: 1,
    opacity: 0.85,
    shadowColor: "black",
    shadowOffset: { width: 5, height: 5 },
    elevation: 3,
    shadowOpacity: 0.1,
  }
})

export default ProfilePicture