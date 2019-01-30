let worker;
if (typeof(Worker) !== "undefined") {
    if (typeof(worker) == "undefined") {
        worker = new Worker("../../controller/UserCourseUpdateWorker.js");
    }
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