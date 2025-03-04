const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://soil-monitor-plant-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function call() {
    const dbRef = ref(database, "Push/-OJy_verTfs7LFNJuhWq");

    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
            } else {
                console.log("No data available");
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

module.exports = call;
