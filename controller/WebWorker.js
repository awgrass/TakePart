importScripts("https://www.gstatic.com/firebasejs/5.5.9/firebase.js");
importScripts('../model/Firebase.js');
let courseDates = new Map();
let workerRef = firestore.collection("courses");
let run = true;

function initializeOrUpdateWorker(){
    workerRef.get()
        .then(snapshot => {
            courseDates = new Map();
            snapshot.forEach(function(course){
                let dates = [];
                for (let key in course.data().dates) {
                    let obj = course.data().dates[key];
                    dates.push(obj.seconds);
                }
                courseDates.set(course.id, course);
            });
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
        await sleep(5000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

self.addEventListener('message', function(e) {
    let data = e.data;
    switch (data.cmd) {
        case 'start':
            if (data.admin === undefined)
                workerRef = workerRef.where("participants", "array-contains", "users/" + data.msg);
            initializeOrUpdateWorker();
            work();
            addWorkerListener();
            break;
        case 'stop':
            self.close(); // Terminates the worker.
            break;
        default:
            self.postMessage('Unknown command: ' + data.msg);
    };
}, false);

function addWorkerListener() {
    firestore.collection("courses").onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                console.log(change.doc.data());
                initializeOrUpdateWorker();
            });
        });
}

