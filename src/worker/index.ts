// @ts-ignore
self.addEventListener('push', (event: any) => {
  let data = { title: 'Controla los Puchos', body: '¡Es tu momento!' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error parsing push data', e);
  }

  const title = data.title;
  const options = {
    body: data.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: '/',
  };

  // @ts-ignore
  event.waitUntil(self.registration.showNotification(title, options));
});

// @ts-ignore
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  // @ts-ignore
  event.waitUntil(
    // @ts-ignore
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        // @ts-ignore
        return client.focus();
      }
      // @ts-ignore
      return self.clients.openWindow('/');
    })
  );
});
