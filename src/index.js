import dotenv from 'dotenv';
import Webcam from './components/webcam';
import OBS from './components/obs';
import cams from '../cams.json';
import cluster from 'cluster';

const configured = dotenv.config();
if (configured.error) {
    throw configured.error;
}

// connect to OBS
const obs = new OBS();

if (cluster.isMaster) {
    // run through each cam, and create them
    cams.forEach((cam, index) => {
        if (index === 0) {
            new Webcam(cam.name, cam.scene, obs);
        }

        if (index !== 0) {
            cluster.fork({
                camIndex: index,
            });
        }
    });
} else {
    const {name, scene} = cams[process.env.camIndex];
    new Webcam(name, scene, obs);
}