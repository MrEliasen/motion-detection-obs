import dotenv from 'dotenv';
import Webcam from './components/webcam';
import OBS from './components/obs';

const configured = dotenv.config();
if (configured.error) {
    throw configured.error;
}

const cams = [];
const camScenes = {
    'HD Pro Webcam C920': 'office',
};

//Creates webcam instance
const nodeCam = nodeWebcam.create();

// connect to OBS
const obs = new OBS();

// run through each cam, and create them
nodeCam.list((list) => {
    list.forEach((camName) => {
        cams.push(new Webcam(camName, camScenes[camName], obs));
    });
});