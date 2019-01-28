var config = {
  apiKey: "AIzaSyCtulKNvt3Ja3aQOxaDf7UWJ3HtbfIthDQ",
  authDomain: "wt01-59106.firebaseapp.com",
  databaseURL: "https://wt01-59106.firebaseio.com",
  projectId: "wt01-59106",
  storageBucket: "wt01-59106.appspot.com",
  messagingSenderId: "600195730115"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

const storage = firebase.storage();
const storageRef = storage.ref();
let img = storageRef.child('images/7I9XFpj.jpg');

console.log(img.fullPath);