// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAeuMs4zomJ8X6UbCf1QTsQ-4qj-7xGSPg",
  authDomain: "maldinihouse-iot.firebaseapp.com",
  databaseURL: "https://maldinihouse-iot-default-rtdb.firebaseio.com",
  projectId: "maldinihouse-iot",
  storageBucket: "maldinihouse-iot.appspot.com",
  messagingSenderId: "225951467716",
  appId: "1:225951467716:web:feed48da1e3d65f5fb6191",
  measurementId: "G-Q6Z4QRQFBR",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

 // Función para actualizar la imagen de la cámara
function updateCameraFeed() {
  const imageRef = ref(database, "/camera/image");
  onValue(imageRef, (snapshot) => {
    const imageData = snapshot.val();
    if (imageData) {
      const imgElement = document.getElementById("camera-stream");
      if (imgElement) {
        imgElement.src = `data:image/jpeg;base64,${imageData}`;
      }
    }
  });
}
// Función para actualizar la interfaz de las variables generales
function updateGeneralUI(data) {
  if (data) {
    document.getElementById("temperature").innerText = data.temperature || "N/A";
    document.getElementById("humidity").innerText = data.humidity || "N/A";
    document.getElementById("distance").innerText = data.distance || "N/A";
    document.getElementById("alert").innerText = data.alert || "Sin alertas";
    document.getElementById("security").innerText = data.securityMode ? "Activado" : "Desactivado";
    document.getElementById("night").innerText = data.nightMode ? "Activado" : "Desactivado";
  }
}

// Función para actualizar la interfaz de los LEDs
function updateLEDUI(ledStates) {
  if (ledStates) {
    Object.keys(ledStates).forEach((key, i) => {
      const state = ledStates[key];
      const button = document.getElementById(`led${i}`);
      if (button) {
        button.innerText = state === "on" ? `Apagar LED ${i + 1}` : `Encender LED ${i + 1}`;
        button.className = state === "on" ? "led-on" : "led-off";
      }
    });
  }
}

// Configurar listeners de Firebase para actualizar los datos en tiempo real
function setupFirebaseListeners() {
  const generalRef = ref(database, "/");
  onValue(generalRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      updateGeneralUI(data);
      if (data.ledStates) {
        updateLEDUI(data.ledStates);
      }
    }
  });
  updateCameraFeed();
}

 // Función para mostrar la cámara
 function toggleCamera() {
  const cameraSection = document.getElementById("camera-section");
  if (cameraSection.style.display === "none") {
    cameraSection.style.display = "block";  // Mostrar la cámara
    updateCameraFeed();  // Iniciar la actualización de la cámara
  } else {
    cameraSection.style.display = "none";  // Ocultar la cámara
  }
}

// Alternar el estado de un LED específico
function toggleLED(index) {
  const ledPath = `ledStates/led${index}`;
  const ledRef = ref(database, ledPath);

  onValue(ledRef, (snapshot) => {
    const currentState = snapshot.val();
    const newState = currentState === "on" ? "off" : "on";

    set(ledRef, newState).catch((error) =>
      console.error(`Error al alternar el estado del LED ${index}:`, error)
    );
  });
}

// Encender todos los LEDs
function allOn() {
  const ledStatesRef = ref(database, "ledStates");
  const newStates = {};
  for (let i = 0; i < 7; i++) {
    newStates[`led${i}`] = "on";
  }

  set(ledStatesRef, newStates).catch((error) => console.error("Error al encender todos los LEDs:", error));
}

// Apagar todos los LEDs
function allOff() {
  const ledStatesRef = ref(database, "ledStates");
  const newStates = {};
  for (let i = 0; i < 7; i++) {
    newStates[`led${i}`] = "off";
  }

  set(ledStatesRef, newStates).catch((error) => console.error("Error al apagar todos los LEDs:", error));
}

// Alternar el modo seguridad
function toggleSecurity() {
  const securityRef = ref(database, "securityMode");

  onValue(securityRef, (snapshot) => {
    const currentState = snapshot.val();
    const newState = !currentState;

    set(securityRef, newState).catch((error) =>
      console.error("Error al alternar el modo seguridad:", error)
    );
  });
}

// Alternar el modo noche
function toggleNight() {
  const nightRef = ref(database, "nightMode");

  onValue(nightRef, (snapshot) => {
    const currentState = snapshot.val();
    const newState = !currentState;

    set(nightRef, newState).catch((error) =>
      console.error("Error al alternar el modo noche:", error)
    );
  });
}

// Agregar listeners a los botones
function setupEventListeners() {
  for (let i = 0; i < 7; i++) {
    const button = document.getElementById(`led${i}`);
    if (button) {
      button.addEventListener("click", () => toggleLED(i));
    }
  }

  document.querySelector(".toggle-button[onclick='allOn()']").addEventListener("click", allOn);
  document.querySelector(".toggle-button[onclick='allOff()']").addEventListener("click", allOff);
  document.querySelector(".main-button[onclick='toggleSecurity()']").addEventListener("click", toggleSecurity);
  document.querySelector(".main-button[onclick='toggleNight()']").addEventListener("click", toggleNight);
}

// Inicializar la aplicación
function init() {
  setupFirebaseListeners();
  setupEventListeners();
}

init();
 
