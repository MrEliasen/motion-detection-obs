import dotenv from 'dotenv';
import Webcam from './components/webcam';
import Server from './components/server';
import cams from '../cams.json';
import cluster from 'cluster';

const configured = dotenv.config();
if (configured.error) {
    throw configured.error;
}

if (cluster.isMaster) {
    // connect to OBS
    const server = new Server();

    // run through each cam, and create them
    cams.forEach((cam, index) => {
        cluster.fork({
            camIndex: index,
        });
    });
} else {
    const {name, scene} = cams[process.env.camIndex];
    new Webcam(name, scene);
}