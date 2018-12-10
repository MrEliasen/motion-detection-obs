import EventEmitter from 'events';
import OBSWebSocket from 'obs-websocket-js';

class OBS extends EventEmitter {
    constructor() {
        super();

        this.obs = new OBSWebSocket();
        this.connected = false;
        this.reconnection = null;

        this.obs.on('ConnectionOpened', () => {
            this.connected = true;

            if (this.reconnection !== null) {
                this._clearReconnectTimer();
            }
        });

        this.obs.on('ConnectionClosed', () => {
            this.connected = false;
            this._reconnect();
        });

        obs.onSwitchScenes((data) => {
            myEmitter.emit('SwitchScenes', data.sceneName);
        });

    }

    _reconnect = () => {
        if (this.reconnection !== null) {
            return;
        }

        this.reconnection = setTimeout(this._connect, 5000);
        console.log(`Unable to connect to OBS, retrying in 5 seconds..`);
    }

    _clearReconnectTimer() {
        if (this.reconnection !== null) {
            try {
                clearTimeout(this.reconnection);
            } catch (err) {} //supress

            this.reconnection = null;
        }
    }

    _connect = () => {
        this._clearReconnectTimer();

        this.obs.connect({
            address: process.env.OBS_HOST,
            password: process.env.OBS_PASSWORD,
        })
        .then(() => {
            console.log(`Connected to OBS.`);
            this.connected = true;
        })
        .then((data) => {
            myEmitter.emit('SwitchScenes', data.currentScene);
        })
        .catch((err) => {
            if (err.errno === 'ECONNREFUSED') {
                this-_reconnect();
            }
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
