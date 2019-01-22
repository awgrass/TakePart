class Statistics {
    constructor(_name, _date, _registered) {
        this.name = _name;
        this.date = _date;
        this.participants = 0;
        this.registered = _registered;
    }
}

function addStatistic(name, date, regParticipants){
    let ref = firestore
        .collection("courses")
        .doc(name).collection("statistics");

    // Add a new document with a generated id.
    ref.add({
        name: name,
        date: date,
        numParticipants: 0,
        numRegistered: regParticipants
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
        numParticipants: increase ? amount + 1 : amount - 1
    })
        .then(function() {
            console.log("Document successfully updated!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
}