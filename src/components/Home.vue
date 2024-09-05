<template>
  <div class="hello">
    <h1>Hola</h1>
    <h3>{{ mainMessage }}</h3>
    <br />
    <div v-if="!registered">
      <form v-on:submit.prevent="registerButton">
        <input type="text" required v-model="userName">
        <br />
        <button type="submit">Unirme</button>
      </form>
    </div>
    
    <div v-if="registered">
      <h4>Firebase Cloud Messaging Token</h4>
      <br />
      <code>{{firebaseToken}}</code>
    </div>

    <div v-show="notificationView">
      <br />
      <h3>Notificación</h3>
      <br />
      <code>
        {{ notificationBody }}
      </code>
    </div>
  </div>
  
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { initializeApp } from "firebase/app";
  import { getMessaging, getToken, onMessage } from 'firebase/messaging';
  import alertSfx from '../assets/alert-exclaim.mp3'
  import axios from 'axios';
  axios.defaults.baseURL = import.meta.env.VITE_API_BASEURL

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FCM_API_KEY,
    authDomain: import.meta.env.VITE_FCM_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FCM_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FCM_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FCM_SENDER_ID,
    appId: import.meta.env.VITE_FCM_APP_ID,
  };
  const vapidKey = import.meta.env.VITE_FCM_CERT_KEY_PAIR;

  let messaging = null;
  let firebaseToken = ref(null);
  let mainMessage = ref();
  let registered = ref();
  let userId;
  let userName = ref();
  let registeredToken;
  let notificationView = ref(false);
  let notificationBody = ref("");
  let sound = new Audio(alertSfx);

  function playSound(audio, numberOfTimes = 1, delay = 3000, firstTime = true ){
    if(firstTime){
       audio.play();
    }
    setTimeout( () => {
       if(!firstTime){
           audio.play();
       }
       numberOfTimes--;
       if(numberOfTimes > 0){
         playSound(audio,numberOfTimes,delay, false);
       }
    }, delay)
  }

  function playTaskAlert() {
    playSound(sound, 10, 1000, false);
  }

  function initFirebaseCloudMessaging () {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
  }

  function requestNotificationPermission () {
    // Request Permission of Notifications
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');

        // Register foreground message event
        onMessage(messaging, (payload) => {
          // Actions to be done when a push message is received and the app is in foreground
          console.log("Push Message received. ", JSON.stringify(payload));
        });
      
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
  }

  function getFcmToken() {
    // Get Token
    getToken(messaging, { vapidKey }).then((currentToken) => {
      firebaseToken.value = currentToken;
      if (registered.value && currentToken != registeredToken) {
        // Update the token on the server
        console.log("The token changed, sending new token to the server");
        updateToken();
      }
      
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
  }

  function checkRegistered() {
    registered.value = localStorage.getItem("registered") == "true" ? true : false;
    if (registered.value) {
      userId = localStorage.getItem("userId");
      userName.value = localStorage.getItem("username");
      registeredToken = localStorage.getItem("fcmToken");
      console.log("You are registered");
      mainMessage = "Tu app está lista para recibir notificaciones";
    } else {
      console.log("You are not registered");
      mainMessage.value = "Escribe tu nombre y únete para comenzar a recibir notificaciones";
    }
  }

  function registerButton() {
    if (firebaseToken.value !== null) {
      register();
    } else {
      alert("No se ha obtenido fcm token, instala la app y asegurate de que tienes conexión.");
    }
  }

  async function register() {
    const params = {
      name: userName.value,
      fcmToken: firebaseToken.value
    }
    axios.post('/users/', params)
      .then(function(response) {
        if (response.status == 200) {
          registered.value = true;
          localStorage.setItem("registered", registered.value);
          localStorage.setItem("userId", response.data);
          localStorage.setItem("username", userName.value);
          localStorage.setItem("fcmToken", firebaseToken.value);
        } else {
          console.log("Registration error");
        }
      })
      .catch(function(error) {
        console.log("Registration error");
      });
  }

  function updateToken() {
    const params = {
      name: userName.value,
      fcmToken: firebaseToken.value
    }

    axios.put('/users/' + userId, params)
      .then(function(response) {
        if (response.status == 200) {
          localStorage.setItem("fcmToken", firebaseToken.value);
        } else {
          console.log("Update Token error");
        }
      })
      .catch(function(error) {
        console.log("Update Token error: ", error);
      });
  }

  function addBroadcastChannelEventListener() {
    const channel = new BroadcastChannel('firebaseSwChannel');
    channel.onmessage = (event) => {
      console.log('BroadcastChannel message received');
      playTaskAlert();
    };
  }

  watch(registered, (newValue, oldValue) => {
    checkRegistered();
  });

  onMounted(() => {
      initFirebaseCloudMessaging();
      checkRegistered();
      requestNotificationPermission();
      getFcmToken();
      addBroadcastChannelEventListener();
  })

</script>

<style>

.hello {
  text-align: center;
}

</style>