var config = {
  apiKey: "AIzaSyDmMse1ds7BnysMdjEgS-4jb38asiC_ooE",
  authDomain: "takepart-attendees.firebaseapp.com",
  databaseURL: "https://takepart-attendees.firebaseio.com",
  projectId: "takepart-attendees",
  storageBucket: "takepart-attendees.appspot.com",
  messagingSenderId: "482659385948"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();

const storage = firebase.storage();
const storageRef = storage.ref();
