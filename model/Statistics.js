class Statistics {
    constructor(date, participated, registeredAtThisTime) {
        this.date = date;
        this.participated = participated;
        this.registeredAtThisTime = registeredAtThisTime;
    }
}

function addStatistic(name, date, registeredAtThisTime){
    let ref = firestore
        .collection("courses")
        .doc(name).collection("statistics");

    // Add a new document with a generated id.
    ref.add({
        name: name,
        date: date,
        participated: 0,
        registeredAtThisTime: registeredAtThisTime
    }).then(function(docRef) {
            console.log("Statistic written ", docRef.id);
        }).catch(function(error) {
            console.error("Error adding statistic: ", error);
        });
}

function updateStatistic(amount, increase) {
    let ref = firestore
        .collection("courses")
        .doc(name).collection("statistics");

    ref.update({
        participated: increase ? amount + 1 : amount - 1
    })
        .then(function() {
            console.log("Document successfully updated!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
}