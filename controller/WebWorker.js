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
            snapshot.forEach(function(course){
                let dates = [];
                for (let key in course.data().dates) {
                    let obj = course.data().dates[key];
                    dates.push(obj.seconds);
                }
                courseDates.set(course.id, course);
                //console.log("C: " + courseDates)
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
                value.data().dates.forEach(function (date) {
                    let time = Date.now() / 1000 ;
                    if ((date.seconds - 1800) < time && time < date.seconds) {
                        showableCourses.push({name: key, date: date, num: value.data().participants.length});
                    }
                })
            });
            postMessage({'msg': showableCourses});
        }
        await sleep(2000);
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
