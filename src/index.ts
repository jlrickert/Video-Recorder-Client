// var video = document.querySelector("#videoElement");

// if (navigator.mediaDevices.getUserMedia) {
//   navigator.mediaDevices
//     .getUserMedia({ video: true })
//     .then(function(stream) {
//       video.srcObject = stream;
//     })
//     .catch(function(err0r) {
//       console.log("Something went wrong!");
//     });
// }

const videoElem = document.getElementById("video");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => (videoElem.srcObject = stream))
    .catch(e => console.log(e));
}
