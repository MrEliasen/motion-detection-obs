import OBSWebSocket from 'obs-websocket-js';


class OBS {
    constructor() {
        this.obs = new OBSWebSocket();
    }

    _connect() {
        this.obs.connect({
            address: 'localhost:4444',
            password: '$up3rSecretP@ssw0rd',
        });
    }

    switchScene(sceneName) {
        this.obs.setCurrentScene({'scene-name': sceneName});
    }
}

export default OBS;
