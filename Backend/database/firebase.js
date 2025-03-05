const { initializeApp } = require("firebase/app");
const { getDatabase, ref } = require("firebase/database");

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://soil-monitor-plant-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database, "stats");


module.exports = { dbRef };
