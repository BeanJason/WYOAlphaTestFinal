import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import UserInput from "../../common/components/UserInput";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Rating } from "react-native-ratings";
import { DataStore } from "aws-amplify";
import { Job, Provider, Review } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { addOrRemoveJob } from "../../redux/jobsReducer";

const UserReview = ({ navigation, route }) => {
  const dispatch = useDispatch()
  let { jobInfo, mainProvider } = route.params;
  const [rate, setRate] = useState(3.0)

  //Set variables for user input
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //Submit the user input
  const submitForm = async (data) => {
    let original = await DataStore.query(Provider, jobInfo.mainProvider)
    let revID = original.providerReviewId
    let originalRev
    let count = 0
    //if first time
    if(!revID){
      originalRev = await DataStore.save(new Review({
        "reviews": []
      }))
      await DataStore.save(Provider.copyOf(original, (updated) => {
        updated.providerReviewId = originalRev.id
      }))
      revID = originalRev.id
      count = 0
    } else{
      let res = await DataStore.query(Review, revID)
      originalRev = res
      if(originalRev){
        count = originalRev.reviews.length
      } else{
        originalRev = await DataStore.save(new Review({
          "reviews": []
        }))
        revID = originalRev.id
        count = 0
      }
    }

    let review
    let valid = true
    for(let next of originalRev.reviews){
      review = JSON.parse(next)
      if(review.jobID == jobInfo.id){
        valid = false
        break
      }
    }
    if(valid){
      count++
      let newRating = (original.overallRating + rate) / count
      newRating = parseFloat(newRating.toFixed(2))
      let review = {
        jobID: jobInfo.id,
        jobDate: jobInfo.requestDateTime,
        jobTitle: jobInfo.jobTitle,
        comment: data.review || "",
        rating: rate
      }
      //update rating
      await DataStore.save(Provider.copyOf(original, (updated) => {
        updated.overallRating = newRating
      }))
      //update review
      await DataStore.save(Review.copyOf(originalRev, (updated) => {
        updated.reviews.push(JSON.stringify(review))
      }))
    }

    let originalJob = await DataStore.query(Job, jobInfo.id)
    if(!originalJob.isRated){
      await DataStore.save(Job.copyOf(originalJob, (updated) => {
        updated.isRated = new Date().toString()
      }))
    }
    let newJobInfo = {...jobInfo}
    newJobInfo.isRated = new Date().toString()
    dispatch(addOrRemoveJob({ type: "REMOVE_OLD_JOB", jobInfo }));
    dispatch(addOrRemoveJob({ type: "ADD_OLD_JOB", jobInfo: newJobInfo }));
    createToast('Review has been submitted')
    navigation.navigate('Home')
  };

  const ratingComplete = (rating) => {
    setRate(parseFloat(rating))
  };

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={[commonStyles.background]}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          <Text style={styles.header2}>
            Please rate your overall satisfaction with the job request and your provider {mainProvider}
          </Text>
          <View style={{ marginBottom: 15 }}>
            <Rating
              showRating
              imageSize={40}
              onFinishRating={(rating) => ratingComplete(rating)}
              style={{ paddingVertical: 10 }}
              jumpValue={0.5}
              fractions={2}
              tintColor="black"
              ratingTextColor="black"
              startingValue={3}
            />
          </View>

          <View style={{alignItems: 'center'}}>
            {/* Description */}
            <UserInput
              style={[styles.input, { height: 120, textAlignVertical: "top", width: 350}]}
              name="review"
              multiline
              rules={{
                maxLength: {
                  value: 350,
                  message: "Review must be 350 words or less",
                },
              }}
              placeholder={"(optional) Write a review"}
              control={control}
            />
            <TouchableOpacity
              onPress={handleSubmit(submitForm)}
              style={[styles.button, {marginTop: 20}]}
            >
              <Text style={[styles.btnText, { textAlign: "center" }]}>
                Submit Review
              </Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header2: {
    fontFamily: "Montserrat-Regular",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "rgba(0,221,255,0.7)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.7)",
    borderRadius: 10,
    padding: 20,
  },
  input: {
    width: 300,
    height: 32,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  field: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "Black",
    paddingBottom: 5,
    justifyContent: "space-evenly",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 160,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
  },
});

export default UserReview;
