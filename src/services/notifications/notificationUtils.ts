export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
) => {
  const FIREBASE_API_KEY =
    'AAAAVvn5IJs:APA91bFnzUmTQB3MRworEFw4cbJDn6Ofr4wbMw7djTslVkiDnKSqCzf3sRqDuy_0sXbPNEqy1R9kPXwo4PrpkUeGFyMouMtsulyfVZd-tqFlkgeFpqzZEk2kQvzkX2XEk98brv4zBr4J';

  const message = {
    registration_ids: [token],
    notification: {
      title: title,
      body: body,
      vibrate: 1,
      sound: 1,
      priority: 'high',
      content_available: true,
    },
  };

  let headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: 'key=' + FIREBASE_API_KEY,
  });

  let response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
  });
  response = await response.json();
  console.log('Send Notification Response: ', response);
};
