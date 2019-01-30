importScripts("https://www.gstatic.com/firebasejs/5.5.9/firebase.js");
importScripts('../model/Firebase.js');
let courseDates = new Map();
let run = true;
let userID;

function initializeOrUpdateWorker(){
    firestore.collection("users").doc(userID).get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data().courses);
            doc.data().courses.forEach(course => {
                firestore.collection("courses").doc(course.id).get().then(c => {
                    let dates = [];
                    for (let key in c.data().dates) {
                        let obj = c.data().dates[key];
                        dates.push(obj.seconds);
                    }
                    courseDates.set(c.id, c);
                });
            })
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
        console.log(courseDates);
    })
    .catch(function(error){
        console.log("Error occurred in web worker: " + error);
    });
}

async function work() {
    while (run) {
        if (courseDates.size > 0) {
            let showableCourses = [];
            courseDates.forEach((value, key) => {
                value.data().dates.forEach(function (date) {
                    let time = Date.now() / 1000 ;
                    if ((date.seconds - 1800) < time && time < date.seconds) {
                        showableCourses.push({name: key, date: date, num: value.data().participants.length});
                    }
                })
            });
            postMessage({'msg': showableCourses});
        }
        await sleep(60000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

self.addEventListener('message', function(e) {
    let data = e.data;
    switch (data.cmd) {
        case 'start':
            userID = data.msg;
            initializeOrUpdateWorker();
            work();
            addWorkerListener();
            break;
        case 'stop':
            self.terminate();
            console.log("Worker terminated")
            break;
        default:
            self.postMessage('Unknown command: ' + data.msg);
    };
}, false);

function addWorkerListener() {
    firestore.collection("courses").onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                initializeOrUpdateWorker();
            });
        });
}

