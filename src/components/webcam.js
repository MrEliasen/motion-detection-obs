import looksSame from 'looks-same';
import nodeWebcam from 'node-webcam';
import Jimp from 'jimp';
import Path from 'path';

class Webcam {
    constructor(camName, sceneName) {
        this.camName = camName;
        this.scene = sceneName;
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

        // set a timer to detect movement every 750ms
        this.interval = setInterval(this._detectMovement, 1000);

        // get the first image
        this._detectMovement();
    }

    _convertImage(newPictureBuffer) {
        return new Promise((resolve) => {
            // convert the buffer to a png
            Jimp.read(newPictureBuffer, (err, image) => {

                if (!image.bitmap.data) {
                    console.log('no image');
                    resolve(null);
                    return;
                }

                // convert image and resize
                image.grayscale();

                // get the image as a buffer
                image.getBuffer(Jimp.MIME_PNG, (err, imageBuffer) => {
                    if (err) {
                        console.log(err);
                    }

                    resolve(imageBuffer);
                });
            });
        });
    }

    areBuffersEqual(bufA, bufB) {
        var len = bufA.length;
        if (len !== bufB.length) {
            return false;
        }
        for (var i = 0; i < len; i++) {
            if (bufA.readUInt8(i) !== bufB.readUInt8(i)) {
                return false;
            }
        }
        return true;
    }

    _takePicture() {
        return new Promise((resolve) => {
            this.cam.capture(this.fileOutput, async (err, newPicture) => {
                if (!newPicture) {
                    resolve(null);
                }

                const imageBuffer = await this._convertImage(newPicture);
                resolve(imageBuffer)
            });
        });
    }

    _detectMovement = async () => {
        const imageBuffer = await this._takePicture();

        if (!imageBuffer) {
            return;
        }

        if (!this.lastPicture) {
            this.lastPicture = imageBuffer;
            return;
        }

        looksSame(
            this.lastPicture,
            imageBuffer,
            {
                ignoreAntialiasing: false,
                tolerance: process.env.MD_TOLERANCE,
                strict: false
            },
            (error, equal) => {
                if (error) {
                    console.log(error);
                    return;
                }

                this.lastPicture = imageBuffer;
                this._changeScene(!equal);
            }
        );
    }

    async _changeScene(hadMovement) {
        if (!hadMovement) {
            return;
        }

        // notify the master of the scene change
        process.send({
            type: 'switchScene',
            scene: this.scene,
        });
    }
}

export default Webcam;
