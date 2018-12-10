import OBS from './obs';

class Server {
    constructor() {
        this.obs = new OBS();
        this.currentScene = '';
        this.lastSwitch = null;

        this.obs.on('SwitchScenes', this._obsSceneSwitched);
        // messages from the cluster children
        process.on('message', this._message);

        // connect OBS
        this.obs._connect();
    }

    _now () {
        return Math.round((new Date()).getTime() / 1000);
    }

    _message = (msg) => {
        if (typeof msg !== 'object') {
            return;
        }

        switch (msg.type) {
            case 'switchScene':
                this._switchScene(msg.scene);
                return;
        }
    }

    _obsSceneSwitched = (data) => {
        this.currentScene = data.sceneName.trim();
        this.lastSwitch = this._now();
    }

    _switchScene(sceneName) {
        if (this.currentScene === sceneName) {
            return;
        }

        if (this._now() - this.lastSwitch < 1) {
            return;
        }

        this.currentScene = sceneName;
    }
}

export default OBS;
