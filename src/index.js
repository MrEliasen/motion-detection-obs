import dotenv from 'dotenv';
import cluster from 'cluster';
import Server from './components/server';
import Webcam from './components/webcam';
import cams from '../cams.json';

const configured = dotenv.config();
if (configured.error) {
    throw configured.error;
}

if (cluster.isMaster) {
    // connect to OBS
    new Server(cluster);
}

if (cluster.isWorker) {
    const {name, scene} = cams[process.env.camIndex];
    new Webcam(name, scene);
}