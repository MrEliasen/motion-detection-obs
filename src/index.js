import dotenv from 'dotenv';
import nodeWebcam from 'node-webcam';
import Webcam from './components/webcam';
import OBS from './components/obs';
import camScenes from '../cams.json';

const configured = dotenv.config();
if (configured.error) {
    throw configured.error;
}

const cams = [];

//Creates webcam instance
const nodeCam = nodeWebcam.create();

// connect to OBS
const obs = new OBS();

// run through each cam, and create them
nodeCam.list((list) => {
    list.forEach((camName) => {
        if (!camName.includes('C920')) {
            return;
        }

        cams.push(new Webcam(camName, camScenes[camName], obs));
    });
});