importScripts("https://www.gstatic.com/firebasejs/5.5.9/firebase.js");
importScripts('../model/Firebase.js');
let courseDates = new Map();
let workerRef = firestore.collection("courses");
let run = true;
let isAdmin;

function initializeWorker(user){
    if (!isAdmin) workerRef = workerRef.where("participants", "array-contains", "users/" + user.uID);
    workerRef.get()
        .then(snapshot => {
            snapshot.forEach(course => {
                const statCollection = "courses/" + course.id + "/statistics";
                let statisticsRef = firestore.collection(statCollection);

                statisticsRef.get().then(snap => {
                    let dates = [];
                    snap.forEach(function (stat) {
                        dates.push(stat.data().date.seconds);
                    });
                    courseDates.set(course.id, dates);
                    console.log("Courses:" + courseDates);
                });
            });
            work();
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
                value.forEach(function (date) {
                    let time = Date.now() / 1000 ;
                    if ((date - 1800) < time && time < date) {
                        showableCourses.push(key);
                    }
                })
            });
        }
        //updateView(showableCourses(key));
        await sleep(2000);
        console.log("after sleep")
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

self.addEventListener('message', function(e) {
    let data = e.data;
    switch (data.cmd) {
        case 'start':
            self.postMessage('WORKER STARTED: ' + data.msg);
            //workerRef = data.db.collection("courses");
            isAdmin = data.msg === undefined;
            initializeWorker(data.msg);
            break;
        case 'stop':
            self.postMessage('WORKER STOPPED: ' + data.msg + '. (buttons will no longer work)');
            self.close(); // Terminates the worker.
            break;
        default:
            self.postMessage('Unknown command: ' + data.msg);
    };
}, false);
