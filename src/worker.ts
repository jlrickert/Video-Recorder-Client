// let ws: WebSocket;

// this.onmessage = ev => {
//   switch (ev.data.command) {
//     case "init": {
//       init(ev.data.uri);
//       break;
//     }
//     case "record": {
//       record(ev.data.chunk);
//       break;
//     }
//   }
// };

// function init(uri) {
//   console.log("Initiating web worker");
//   const ws = new WebSocket(uri, "video-protocol");
// }

// function record(data) {
//   console.log("Sending data:", data);
//   ws.send(data);
// }
