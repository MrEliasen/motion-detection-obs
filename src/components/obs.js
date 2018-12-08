import OBSWebSocket from 'obs-websocket-js';


class OBS {
    constructor() {
        this.obs = new OBSWebSocket();
        this.connected = false;
        this.reConnecting = false;
        this.currentScene = '';
        this.lastSwitch = null;

        this.obs.on('SwitchScenes', (data) => {
            this.currentScene = data.sceneName.trim();
            this.lastSwitch = this._now();
        });

        this.obs.on('ConnectionOpened', () => {
            this.connected = true;

            if (this.reconnection !== null) {
                clearTimeout(this.reconnection);
                this.reconnection = null;
            }
        });

        this.obs.on('ConnectionClosed', () => {
            this.connected = false;
            this._reconnect();
        });

        this._connect();
    }

    _now () {
        return Math.round((new Date()).getTime() / 1000);
    }

    _reconnect = () => {
        if (this.reconnection !== null) {
            return;
        }

        this.reconnection = setTimeout(this._connect, 5000);
        console.log(`Unable to connect to OBS, retrying in 5 seconds..`);
    }

    _connect = () => {
        if (this.reconnection !== null) {
            clearTimeout(this.reconnection);
            this.reconnection = null;
        }

        this.obs.connect({
            address: 'localhost:4444',
            password: '$up3rSecretP@ssw0rd'
        })
        .then(() => {
            console.log(`Connected to OBS.`);
            this.connected = true;
        })
        .then((data) => {
            this.currentScene = data.currentScene;
        })
        .catch((err) => {
            if (err.errno === 'ECONNREFUSED') {
                this-_reconnect();
            }
        });
    }

    switchScene(sceneName) {
        try {
            if (!this.connected || this.currentScene === sceneName) {
                return;
            }

            if (this._now() - this.lastSwitch < 1) {
                return;
            }

            console.log('Switching Scene:', sceneName);
            this.currentScene = sceneName;
            this.obs.setCurrentScene({'scene-name': sceneName});
        } catch (err) {}
    }
}

export default OBS;
