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

    ref.doc(date.seconds.toString())
        .update({participated: 0})
        .then(() => {
            // document exists
            console.log("exists");
        })
        .catch((error) => {
            ref.doc(date.seconds.toString())
                .set({
                    date: date,
                    participated: 0,
                    registeredAtThisTime: registeredAtThisTime
                });
        });
}

//Function works but is to be optimized. It decreases or increases amount of participants.
function updateStatistic(name, date, increase) {
    let ref = firestore
        .collection("courses")
        .doc(name).collection("statistics"); //.where("date.seconds", "==", date.getTime() / 1000);

        ref.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (date.seconds !== doc.data().date.seconds)return;
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