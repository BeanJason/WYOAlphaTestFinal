import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import Spinner from "../../common/components/Spinner";
import { commonStyles } from "../../common/styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useEffect, useState } from "react";
import { API, DataStore, graphqlOperation } from "aws-amplify";
import { refundPayment } from "../../src/graphql/mutations";
import { Job, Provider, User } from "../../src/models";
import { createToast } from "../../common/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { addOrRemoveJob, reinitialize } from "../../redux/jobsProviderReducer";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { createProviderReminder, sendNotificationToUser } from "../../notifications";
import { sendProviderJobSignupEmail } from "../../common/functions";

const moment = extendMoment(Moment);

//Login screen
const JobSignUp = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { activeJobs } = useSelector((state) => state.providerJobs);
  const { jobInfo } = route.params;
  const [mainProvider, setMainProvider] = useState("");
  const [backupProviders, setBackupProviders] = useState([]);
  const [canSignUp, setCanSignUp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startSignUp, setStartSignUp] = useState(false);
  const [role, setRole] = useState("Main Provider");
  const { authUser, userInfo } = useSelector((state) => state.auth);
  const [date, setDate] = useState()
  const [time, setTime] = useState()
  const [ownerName, setOwnerName] = useState('')

  const getDateFormat = () => {
    let formatDate = new Date(jobInfo.requestDateTime)
    let hours = formatDate.getHours() % 12 || 12;
    let min = (formatDate.getMinutes() < 10 ? "0" : "") + formatDate.getMinutes();
    let durationHour = (formatDate.getHours() + jobInfo.duration) % 12 || 12
    let amOrPm = "AM";
    let durationAmOrPm = "AM"
    if (formatDate.getHours() >= 12) {
      amOrPm = "PM";
    }
    if(formatDate.getHours() + jobInfo.duration >= 12){
      durationAmOrPm = "PM"
    }
    setDate(formatDate.toLocaleDateString())
    setTime(`from ${hours}:${min}${amOrPm}-${durationHour}:${min}${durationAmOrPm}`)
  }

  const getBackupProviders = () => {
    let text = "";
    for (let next of backupProviders) {
      text += next + "\n";
    }
    return text;
  };

  const getProviders = async () => {
    //set main provider if available
    if (jobInfo.mainProvider) {
      if (jobInfo.mainProvider == userInfo.userID) {
        setMainProvider(`${userInfo.firstName} ${userInfo.lastName}`);
      } else {
        await DataStore.query(Provider, jobInfo.mainProvider).then((providerFound) => {
          setMainProvider(`${providerFound.firstName} ${providerFound.lastName}`);
        });
      }
    }
    //set backup providers if available
    if (jobInfo.backupProviders && jobInfo.backupProviders.length != 0) {
      let listOfBackups = [];
      for (let next of jobInfo.backupProviders) {await DataStore.query(Provider, next).then((providerFound) => {
          listOfBackups.push(`${providerFound.firstName} ${providerFound.lastName}`);
        });
      }
      setBackupProviders(listOfBackups);
    }
  };

  const getRequestOwnerName = async () => {
    await DataStore.query(User, jobInfo.requestOwner).then((user) => setOwnerName(user.firstName + " " + user.lastName))
      .catch((error) => console.log(error))
  }

  const signUpForJob = async () => {
    setStartSignUp(true);
    //sign up as main
    const original = await DataStore.query(Job, jobInfo.id);
    if (role == "Main Provider") {
      jobInfo.mainProvider = userInfo.userID
      let ids = await createProviderReminder(jobInfo)
      try {
        await DataStore.save(
          Job.copyOf(original, (updated) => {
            updated.mainProvider = userInfo.userID;
            updated.currentStatus = 'ACCEPTED'
            updated.providerNotificationID?.push(ids[0])
            updated.providerNotificationID?.push(ids[1])
          })
        );
        //if success
        jobInfo.providerNotificationID = ids
        //send push notification to the user
        let messageInfo = {
          title: 'Job Request Accepted',
          message: `${userInfo.firstName} has accepted your job request as a main provider for your ${jobInfo.jobTitle} job`
        }
        await sendNotificationToUser(original.requestOwner, messageInfo)
        //send email
        await sendProviderJobSignupEmail(jobInfo, userInfo.firstName, authUser.email, ownerName)
        dispatch(addOrRemoveJob({ type: "ADD_ACTIVE_JOB", jobInfo }));
        setTimeout(() => {
          createToast(
            "You have successfully signed up as a main provider for the job. If you wish to cancel please do so at least 3 days before the job date"
          );
          setStartSignUp(false);
          dispatch(reinitialize());
          navigation.navigate("Home");
        }, 5000);
      } catch (error) {
        console.log(error);
      }
    }
    //sign up as backup
    else {
      try {
        await DataStore.save(
          Job.copyOf(original, (updated) => {
            updated.backupProviders.push(userInfo.userID);
          })
        );
        //if success
        dispatch(addOrRemoveJob({ type: "ADD_ACTIVE_JOB", jobInfo }));
        setTimeout(() => {
          createToast(
            "You have successfully signed up as a backup provider for the job"
          );
          setStartSignUp(false);
          dispatch(reinitialize());
          navigation.navigate("Home");
        }, 5000);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getDateFormat();
    getProviders();
    getRequestOwnerName();
    //check if there is 1 main and 2 backups already
    if(jobInfo.mainProvider && jobInfo.backupProviders.length == 2){
      setCanSignUp(false)
    }
    else{
      //check for time conflict
      let jobStart = new Date(jobInfo.requestDateTime);
      let jobEnd = new Date(jobInfo.requestDateTime)
      jobEnd.setHours(jobEnd.getHours() + jobInfo.duration)
      const jobRange = moment.range(jobStart, jobEnd)
      
      let start, end, range;
      for (let job of activeJobs) {
        start = new Date(job.requestDateTime);
        end = new Date(job.requestDateTime)
        end.setHours(end.getHours() + job.duration)
        range = moment.range(start, end)
        if(jobRange.overlaps(range)){
          setCanSignUp(false)
          break;
        } 
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (mainProvider != "") {
      setRole("Backup Provider");
    }
  }, [mainProvider]);

  if (loading) {
    return <Spinner color={"#0EFC11"} />;
  }

  return (
    <KeyboardAwareScrollView>
      <ImageBackground
        style={commonStyles.background}
        source={require("../../assets/wyo_background.png")}
      >
        <SafeAreaView style={commonStyles.safeContainer}>
          {/* MODAL */}
          <Modal
            visible={showModal}
            transparent
            animationType="slide"
            hardwareAccelerated
          >
            <View style={styles.centeredView}>
              {canSignUp ? (
                <View style={styles.warningModal}>
                  <Text style={styles.modalTitle}>Warning</Text>
                  <Text style={styles.modalText}>
                    You are about to sign up for this job as a {role}. Are you
                    sure you want to continue?
                  </Text>
                  <Text style={[styles.noteText, {textAlign: 'center',marginTop: 10}]}>Note: If you wish to cancel after signing up please do so at least 3 days before the job date. Failure to do so will result in an offense</Text>
                  {startSignUp ? (
                    <Spinner color={"black"} />
                  ) : (
                    //Buttons
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        marginTop: 40,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setShowModal(false)}
                        style={styles.button}
                      >
                        <Text style={styles.btnText}>No</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => signUpForJob()}
                        style={styles.button}
                      >
                        <Text style={styles.btnText}>Yes</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.warningModal}>
                  <Text style={styles.modalTitle}>Sign Up</Text>
                  <Text style={styles.modalText}>
                    You cannot sign up for this job due to a date & time
                    conflict.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={[
                      styles.button,
                      { alignSelf: "center", marginTop: 10 },
                    ]}
                  >
                    <Text style={styles.btnText}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Modal>

          <Text style={styles.head}>Job Details</Text>
          <View style={styles.jobContainer}>
            <View style={{ alignItems: "flex-end", marginBottom: -10 }}>
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={styles.button}
              >
                <Text style={styles.btnText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{jobInfo.jobTitle}</Text>
              <Text style={styles.generalText}>Request Owner: {ownerName}</Text>
              <Text style={styles.generalText}>Duration: {jobInfo.duration}</Text>
            <Text style={styles.generalText}>Location: {jobInfo.city} {jobInfo.zipCode}</Text>
            <Text style={styles.generalText}>Scheduled for {date}</Text>
            <Text style={[styles.generalText, {marginBottom: 30}]}>{time}</Text>
            {jobInfo.jobDescription ? (
              <Text style={[styles.generalText, { marginBottom: 30 }]}>
                Job Description: {jobInfo.jobDescription}
              </Text>
            ) : (
              <></>
            )}
            <Text style={[styles.generalText, { marginBottom: 10 }]}>
              Main Provider: {mainProvider ? mainProvider : "None"}
            </Text>
            {backupProviders.length == 0 ? (
              <></>
            ) : (
              <View>
                <Text
                  style={[
                    styles.generalText,
                    { borderBottomWidth: 1, alignSelf: "flex-start" },
                  ]}
                >
                  Backup Providers
                </Text>
                <Text style={styles.generalText}>{getBackupProviders()}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  head: {
    fontFamily: "Montserrat-Bold",
    fontSize: 30,
    padding: 5,
    textAlign: "center",
    marginBottom: 10,
  },
  headerText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
    textAlign: "center",
  },
  jobContainer: {
    borderColor: "rgba(0,221,255,0.9)",
    borderWidth: 1,
    backgroundColor: "rgba(0,221,255,0.9)",
    borderRadius: 10,
    padding: 10,
    width: Dimensions.get("window").width,
    marginVertical: 10,
    elevation: 10,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    padding: 5,
    borderBottomColor: "black",
    borderBottomWidth: 2,
    marginBottom: 10,
  },
  generalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    fontWeight: "800",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 40,
    backgroundColor: "black",
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000090",
  },
  warningModal: {
    width: 350,
    height: 300,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 25,
    borderBottomColor: "black",
    borderBottomWidth: 2,
    marginBottom: 10,
    alignSelf: "center",
  },
  modalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 17,
    padding: 5,
    borderBottomColor: "black",
    borderBottomWidth: 3,
    marginBottom: 5,
    alignSelf: "center",
    textAlign: "center",
  },
  noteText: {
    fontFamily: "Montserrat-Italic",
    fontSize: 14,
  },
});

export default JobSignUp;
