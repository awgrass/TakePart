/*
Class: Statistics
Statistic Object containing its properties
*/
class Statistics {
    constructor(date, participated, registeredAtThisTime, participants) {
        this.date = date;
        this.participated = participated;
        this.registeredAtThisTime = registeredAtThisTime;
        this.participants = participants;
    }
}

/*
Function: addStatistic
Adds a statistic document to a course into the database

Parameters:
{String} name - Course name
{Date} date - Date
{Integer} registeredAtThisTime - Amount registered people
*/
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
                    participants: [],
                    registeredAtThisTime: registeredAtThisTime
                });
        });
}

/*
Function: updateStatistic
Updates a statistic document increasing the partecipation count


Parameters:
{String} name - Course name
{Date} date - Date
{Boolean} increase - true if increase/false if decrease
*/
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

                let participantRef = getUserRefByID(auth.currentUser.uid);
                ref.doc(doc.id).update({
                    participants: firebase.firestore.FieldValue.arrayUnion(participantRef),
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