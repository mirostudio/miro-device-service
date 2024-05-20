# Dummy WebSocket Server

This source directory contains a dummy implementation of WebSocket
server which is used to handle the requests generating out of the main application during development and testing.

The main Node application contains a component that communicates with the Qt-based media player UI running inside the same host. That Qt-based player UI acts as the WebSocket server, and the Node.js process acts as the corresponding WebSocket client, and they are constantly talking to each other. Generally, the Node service would sync with the cloud and keeps sending all instructions to the player UI and tells which videos to play and at what time instants.

During development phase it is somewhat cumbersome two bring up both the Node process and the QT-based UI process, so we built this dummy WebSocket server which helps to test the main Node application. Since these are in the same repo they can be started in two tabs on the same working directory, using the commads:

```C++
// Start the demo server.
npm run dev:wsserver

// Start the main app.
npm run dev
```