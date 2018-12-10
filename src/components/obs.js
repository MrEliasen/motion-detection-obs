import EventEmitter from 'events';
import OBSWebSocket from 'obs-websocket-js';

class OBS extends EventEmitter {
    constructor() {
        super();

        this.obs = new OBSWebSocket();
        this.initialised = false;
        this.connected = false;

        this.obs.on('ConnectionOpened', () => {
            this.connected = true;
        });

        this.obs.on('ConnectionClosed', () => {
            this.connected = false;
            this._reconnect();
        });

        obs.onSwitchScenes((data) => {
            myEmitter.emit('SwitchScenes', data.sceneName);
        });

        this._heartBeat();
    }

    _heartBeat = () => {
        if (this.connected || !this.initialised) {
            return;
        }

        setInterval(this._connect, 5000);
    }

    _connect = () => {
        this.obs.connect({
            address: process.env.OBS_HOST,
            password: process.env.OBS_PASSWORD,
        })
        .then(() => {
            console.log(`Connected to OBS.`);
            this.connected = true;
            this.initialised = true;
        })
        .then((data) => {
            myEmitter.emit('SwitchScenes', data.currentScene);
        })
        .catch((err) => {
            this.initialised = true;
        });
    }

    switchScene(sceneName) {
        try {
            if (!this.connected) {
                return null;
            }

            this.obs.setCurrentScene({'scene-name': sceneName});
            return sceneName;
        } catch (err) {
            return null;
        }
    }
}

export default OBS;
