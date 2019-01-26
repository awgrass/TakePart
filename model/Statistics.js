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
        date: date,
        participated: 0,
        registeredAtThisTime: registeredAtThisTime
    }).then(function(docRef) {
            console.log("Statistic written ", docRef.id);
        }).catch(function(error) {
            console.error("Error adding statistic: ", error);
        });
}

//Function works but is to be optimized. It decreases or increases amount of participants.
function updateStatistic(name, date, increase) {
    let ref = firestore
        .collection("courses")
        .doc(name).collection("statistics"); //.where("date.seconds", "==", date.getTime() / 1000);

        ref.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (date.getTime() / 1000 !== doc.data().date.seconds)return;
                if (increase && doc.data().participated >= doc.data().registeredAtThisTime)
                    throw "Cant be more participants than registered people.";
                else if (!increase && doc.data().participated <= 0)
                    throw "Cant be less than 0 participants.";

                ref.doc(doc.id).update({
                    participated: increase ? doc.data().participated + 1 : doc.data().participated - 1
                })
                .then(function() {
                    console.log("Document successfully updated!");
                })
                .catch(function(error) {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                });
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}