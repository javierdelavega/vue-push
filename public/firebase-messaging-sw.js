// [START initialize_firebase_in_sw]

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js

// NOTE: It's safe to expose this info to the client. FCM API keys are not designed to be private.
// To avoid storing this variables in the repo, and DRY, there are some workarounds:
// Since firebase sdk NEEDS a 'firebase-messaging-sw.js' file in the root of the project, and we
// can't inject env variables outside a module. We can use a webpack plugin, or a custom script to do this
// https://stackoverflow.com/questions/54356415/how-can-i-customize-my-service-worker-based-on-environment-variables
// https://medium.com/@daeram.chung/fcm-service-worker-vite-8deccfc23fe2
firebase.initializeApp({
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  projectId:'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/img/icons/icon-192x192.png',
    requireInteraction: true
  };

  // Call to the backend notification received confirmation endpoint
const options = {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  }
};

const confirmationUrl = 'https://vue-push-back.smartidea.es/notifications/confirm/' + payload.data.message_id;
console.log('Sending confirmation request url: ', confirmationUrl);
fetch(confirmationUrl, options)
  .then(data => {
      if (!data.ok) {
        throw Error(data.status);
       }
       return data.json();
      }).then(update => {
        console.log(update);
      }).catch(e => {
        console.log(e);
      });

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // Notify the foreground app
  const channel = new BroadcastChannel('firebaseSwChannel');
  channel.postMessage('notification');
});

// Action when user clicks on notification
self.onnotificationclick = (event) => {
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({includeUncontrolled: true})
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      }),
  );
};

// [END initialize_firebase_in_sw]