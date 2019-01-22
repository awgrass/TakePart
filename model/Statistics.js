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
        name: "name",
        date: date,
        numParticipants: 0,
        numRegistered: regParticipants
    }).then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        }).catch(function(error) {
            console.error("Error adding document: ", error);
        });
}

function addStatistic2(name, date, regParticipants){
    let ref = firestore
        .collection("courses")
        .doc(name);


    return ref.update({
        statistics: {
            amount: 0,
            totalamount: 5
        }
    })
        .then(function() {
            console.log("Document successfully updated!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
}