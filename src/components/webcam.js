import looksSame from 'looks-same';
import nodeWebcam from 'node-webcam';
import Jimp from 'jimp';
import Path from 'path';

class Webcam {
    constructor(camName, sceneName, obs) {
        this.scene = sceneName;
        this.obs = obs;
        this.cam = nodeWebcam.create({
            //Delay to take shot
            delay: 0,
            //Save shots in memory
            saveShots: false,
            // [jpeg, png] support varies
            // Webcam.OutputTypes
            output: "png",
            //Which camera to use
            //Use Webcam.list() for results
            //false for default device
            device: camName,
            // [location, buffer, base64]
            // Webcam.CallbackReturnTypes
            callbackReturn: "buffer",
            //Logging
            verbose: false
        });
        this.fileOutput = Path.join(__dirname, '../../images/', camName.replace(/[^a-z0-9\_\-]/gi, '_').toLowerCase());
        this.lastPicture = null;

        // get the first image
        this._detectMovement();
        // set a timer to detect movement every 750ms
        this.interval = setInterval(this._detectMovement, 750);
    }

    async _convertImage(newPictureBuffer) {
        // convert the buffer to a png
        Jimp.read(newPictureBuffer, (err, image) => {
            // convert image and resize
            image.grayscale().resize(640, 360);
            // get the image as a buffer
            image.getBuffer(Jimp.MIME_PNG, (err, imageBuffer) => {
                Promise.resolve(imageBuffer);
            });
        });
    }

    async _takePicture() {
        try {
            this.cam.capture(this.fileOutput, async (err, newPicture) => {
                const imageBuffer = await this._convertImage(newPicture);
                Promise.resolve(imageBuffer)
            });
        } catch(error) {
            console.log(error);
        }
    }

    async _changeScene(hadMovement) {
        if (!hadMovement) {
            return;
        }

        // do OBS magic here
        this.obs.switchScene(this.sceneName);
    }

    _detectMovement = async () => {
        let imageBuffer = await this._takePicture();

        if (!this.lastPicture) {
            this.lastPicture = imageBuffer;
            return;
        }

        looksSame(
            this.lastPicture,
            imageBuffer,
            {
                ignoreAntialiasing: true,
                tolerance: process.env.MD_TOLERANCE,
                strict: false
            },
            (error, equal) => {
                if (error) {
                    console.log(error);
                    return;
                }

                this.lastPicture = imageBuffer;
                this._changeScene(equal);
            }
        );
    }
}

export default Webcam;
