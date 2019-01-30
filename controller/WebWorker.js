let worker;

// Function: startWorker
// Starts the Web Worker
function startWorker() {
    if (typeof(Worker) !== "undefined") {
        if (typeof(worker) == "undefined") {
            worker = new Worker("../../controller/UserCourseUpdateWorker.js");
        }
        getUserById(currentUser.uid, function (user) {
            worker.postMessage({'cmd': 'start', 'msg': user.uID});
        });
        console.log("Web worker started to work.");
        worker.onmessage = function(e) {
            if (e.data.msg !== undefined) {
                renderUserLandingPage(e.data.msg);
            }
            console.log(e.data);
        };
    } else {
        console.log("Web workers not supported from browser.")
    }
}


// Function: stopWorker
// Terminates the Web Worker
function stopWorker() {
    worker.terminate();
    worker = undefined;
    console.log("Woker terminated.")
}
