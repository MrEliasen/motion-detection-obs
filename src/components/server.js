import OBS from './obs';
import cams from '../../cams.json';

class Server {
    constructor(cluster, workers) {
        this.currentScene = '';
        this.cluster = cluster;
        this.lastSwitch = null;

        this.obs = new OBS();
        this.obs.on('SwitchScenes', this._obsSceneSwitched);
        this.obs._connect();

        this._setupCams();
    }

    _setupCams() {
        cams.forEach((cam, index) => {
            const worker = this.cluster.fork({camIndex: index});
            worker.on('message', this._message);
        });
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

    _obsSceneSwitched = (sceneName) => {
        this.currentScene = sceneName;
        this.lastSwitch = this._now();
    }

    _switchScene(sceneName) {
        if (this.currentScene === sceneName) {
            return;
        }

        if (this._now() - this.lastSwitch < 1) {
            return;
        }

        this.obs.switchScene(sceneName);
    }
}

export default Server;
