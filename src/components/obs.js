import OBSWebSocket from 'obs-websocket-js';


class OBS {
    constructor() {
        this.obs = new OBSWebSocket();
        this.connected = false;

        this._connect();
    }

    _connect = () => {
        this.obs.connect({
            address: 'localhost:4444',
            password: '$up3rSecretP@ssw0rd'
        })
        .then(() => {
            console.log(`Connected to OBS.`);
            this.connected = true;
        })
        .catch((err) => {
            this.connected = false;
            console.log(`Unable to connect to OBS, retrying in 5 seconds..`);
            setTimeout(this._connect, 5000);
        });
    }

    switchScene(sceneName) {
        try {
            if (!this.connected) {
                return;
            }

            console.log('Switching Scene:', sceneName);
            this.obs.setCurrentScene({'scene-name': sceneName});
        } catch (err) {}
    }
}

export default OBS;
