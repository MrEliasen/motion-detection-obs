import nodeWebcam from 'node-webcam';

//Creates webcam instance
const nodeCam = nodeWebcam.create();

// run through each cam, and create them
nodeCam.list((list) => {
    console.log('----- CAM LIST -----');
    list.forEach((camName) => {
        console.log(camName);
    });
    console.log('--------------------');
});