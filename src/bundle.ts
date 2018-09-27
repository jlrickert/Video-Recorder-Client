const videoElem = document.getElementById("video") as HTMLVideoElement;
const recVideoElem = document.getElementById(
  "recievedVideo"
) as HTMLVideoElement;

function base64ToRaw(data: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(data.split(",")[1]);

  const mimeString = data
    .split(",")[0]
    .split(":")[1]
    .split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const view = new DataView(ab);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    view.setUint8(i, byteString.charCodeAt(i));
  }
  return view;
}

function record(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ws: WebSocket
) {
  let id: number;
  const fn = () => {
    context.drawImage(videoElem, 0, 0, 640, 480);
    // const image = canvas.toDataURL("image/webp", 0.25);
    // const image = canvas.toDataURL("image/jpg", 0.25);
    const image = canvas.toDataURL("image/png", 1);
    ws.send(image);
    // id = (fn);
  };
  // id = requestAnimationFrame(fn);
  setInterval(fn, 200);
}

async function main(): Promise<any> {
  const wsSender = new WebSocket("wss://192.168.1.14:8090/ws");
  const wsReciever = new WebSocket("wss://192.168.1.14:8090/ws");

  const sourceCanvas = document.createElement("canvas") as HTMLCanvasElement;
  const sourceContext = sourceCanvas.getContext("2d");
  sourceCanvas.width = 640;
  sourceCanvas.height = 480;

  const receiveCanvas = document.getElementById(
    "recieved"
  ) as HTMLCanvasElement;
  // const receiveCanvas = document.createElement("canvas") as HTMLCanvasElement;
  const receiveContext = sourceCanvas.getContext("2d");
  receiveCanvas.width = 640;
  receiveCanvas.height = 480;

  wsSender.onopen = ev => {
    console.log("Source connected");
    record(sourceContext, sourceCanvas, wsSender);
  };

  wsSender.onclose = ev => {
    console.log("Source closed connection");
  };

  // recVideoElem.srcObject =;
  const image = new Image();
  image.onload = ev => {
    console.log("drawing");
    receiveContext.drawImage(image, 0, 0, 640, 480);
  };
  // image.src =
  //   "data:image/gif;base64,R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==";

  wsReciever.onmessage = ev => {
    image.src = ev.data;
    // image.src = ev.data;
    // console.log(ev.data.length, ev.data);
    // receiveContext.canvas.
    // const url = window.URL.createObjectURL(ev.data);
    // recVideoElem.src = url;
    // recVideoElem.src = img;
  };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoElem.srcObject = stream;
    });
  }
}

main().catch(e => console.log(e));
