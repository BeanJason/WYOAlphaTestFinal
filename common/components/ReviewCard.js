import { useState } from "react"
import { useEffect } from "react"
import { StyleSheet, Text, View, Dimensions } from "react-native"
import Spinner from "./Spinner";

//Show a spinner loading on a screen
const ReviewCard = ({review}) => {
    const [jobDate, setJobDate] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let date = new Date(review.jobDate)
        setJobDate(date)
        setLoading(false)
    },[])

    if(loading){
        return ( <Spinner/> )
    }


    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.noteText}>Date of Job: {jobDate.toLocaleDateString()} {jobDate.toLocaleTimeString()}</Text>
                <Text style={[styles.noteText, {alignSelf: 'flex-end'}]}>Rating: {review.rating}</Text>
            </View>
            <Text style={[styles.generalText, styles.title]}>Job Title: {review.jobTitle}</Text>
            <Text style={[styles.generalText, {alignSelf: 'flex-start', borderBottomWidth: 1, marginTop: 10}]}>Comment</Text>
            <Text style={{fontFamily: "Montserrat-Regular", fontSize: 14}}>{review.comment}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //borderColor: "rgba(0,221,255,0.9)",
        borderColor: "rgba(241,190,72,0.9)",
        borderWidth: 1,
        //backgroundColor: "rgba(0,221,255,0.9)",
        backgroundColor: "rgba(241,190,72,0.9)",
        borderRadius: 10,
        padding: 10,
        width: Dimensions.get("window").width,
        marginVertical: 10,
        elevation: 10,
        flex: 1
        // height: '50%'
      },
      generalText: {
        fontFamily: "Montserrat-Bold",
        fontSize: 18,
        marginRight: 5,
      },
      noteText: {
        fontFamily: "Montserrat-Italic",
        fontSize: 14,
      },
})

export default ReviewCard