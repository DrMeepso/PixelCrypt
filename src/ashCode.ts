class Vector3 {

    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

}

type MatrixEntry = {

    position: Vector3;
    value: string;

}

function CreateCharMatrix() {

    let Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=."
    let MatrixSize = new Vector3(4, 4, 5);

    let Matrix: Array<MatrixEntry> = [];

    for (let x = 0; x < MatrixSize.x; x++) {
        for (let y = 0; y < MatrixSize.y; y++) {
            for (let z = 0; z < MatrixSize.z; z++) {
                Matrix.push({
                    position: new Vector3(x, y, z),
                    value: Chars.charAt(z + (y * MatrixSize.z) + (x * MatrixSize.z * MatrixSize.y))
                });
            }
        }
    }

    return Matrix;

}

class Pixel {
    r: number = 0;
    g: number = 0;
    b: number = 0;
    a: number = 0;

    constructor(r: number, g: number, b: number, a: number) {

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

    }

}

function PixelDataToObject(PixelData: Uint8ClampedArray) {

    let Pixels: Pixel[] = [];

    for (let i = 0; i < PixelData.length; i += 4) {
        Pixels.push(new Pixel(PixelData[i], PixelData[i + 1], PixelData[i + 2], PixelData[i + 3]));
    }

    return Pixels;

}

const CharMatrix: MatrixEntry[] = CreateCharMatrix();

export function EncodeImage(image: string, text: string): Promise<string> {

    return new Promise((resolve, reject) => {

        var NewImage = new Image();
        NewImage.src = image;

        NewImage.onload = function () {

            let Canvas: HTMLCanvasElement = document.getElementById("Render") as HTMLCanvasElement;
            Canvas.width = NewImage.width;
            Canvas.height = NewImage.height;

            let Context: CanvasRenderingContext2D = Canvas.getContext("2d") as CanvasRenderingContext2D;
            Context.imageSmoothingEnabled = false
            Context.drawImage(NewImage, 0, 0);

            ContinueProsess()

        }

        const ContinueProsess = () => {

            let ImageSize = NewImage.width * NewImage.height;
            console.log(Math.floor(ImageSize / 9) + " chars max!");
            console.log(text.length + " chars to encode!");

            // visualize lost pixels
            let width = Math.floor(NewImage.width / 3);
            let height = Math.floor(NewImage.height / 3);

            let Canvas: HTMLCanvasElement = document.getElementById("Render") as HTMLCanvasElement;
            let Context: CanvasRenderingContext2D = Canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

            let encodedText = btoa(text) + "."

            if (encodedText.length > Math.floor(ImageSize / 9)) {
                console.error("Text is too long!");
                return
            }

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {

                    let PixelInfo = new Pixel(0, 0, 0, 0);

                    let CharIndex = (y * width) + x;

                    if (CharIndex > encodedText.length) continue;

                    // get the RBG values of the nabor pixels
                    let PixelData = Context.getImageData((x * 3), (y * 3), 3, 3).data;
                    let Nabors = PixelDataToObject(PixelData);

                    for (let i = 0; i < Nabors.length; i++) {

                        if (i == 4) continue; // skip the middle pixel (the one we are trying to recreate

                        PixelInfo.r += Nabors[i].r;
                        PixelInfo.g += Nabors[i].g;
                        PixelInfo.b += Nabors[i].b;
                    }

                    let char = encodedText.charAt(CharIndex)
                    let charPosition = CharMatrix.find((entry) => entry.value == char)?.position;

                    if (charPosition == undefined) {
                        console.error("Char not found in matrix!");
                        continue
                    }

                    PixelInfo.r = (Math.floor(PixelInfo.r / 8) > 4 ? Math.floor(PixelInfo.r / 8) - 4 : 0) + charPosition?.x;
                    PixelInfo.g = (Math.floor(PixelInfo.g / 8) > 4 ? Math.floor(PixelInfo.g / 8) - 4 : 0) + charPosition?.y;
                    PixelInfo.b = (Math.floor(PixelInfo.b / 8) > 5 ? Math.floor(PixelInfo.b / 8) - 5 : 0) + charPosition?.z;
                    PixelInfo.a = Nabors[4].a;

                    Context.fillStyle = "rgba(" + PixelInfo.r + "," + PixelInfo.g + "," + PixelInfo.b + "," + PixelInfo.a + ")";
                    Context.fillRect((x * 3) + 1, (y * 3) + 1, 1, 1);
                }
            }

            console.log("done! encode!")
            console.log(text)
            resolve(Canvas.toDataURL() as string)

        }

    })

}

//EncodeImage("tery.png", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac bibendum dui. Nullam semper mi non purus tempor mollis. Etiam nec ex congue, ullamcorper ante vitae, aliquam ligula. Nam sit amet neque aliquet, vulputate mi non, auctor ligula. Duis accumsan lorem vel viverra accumsan. Mauris sem lorem, tempor ut malesuada sed, sagittis ut tellus. Nam porta condimentum arcu, vel fringilla orci. Suspendisse vitae enim a nisi fringilla tempus vitae eget lectus. Proin nunc ante, lobortis eu orci in, laoreet congue lorem. Donec eu ligula vitae augue consectetur efficitur. Morbi ut tortor in dolor varius volutpat. Fusce vulputate semper lorem eu pharetra. Vivamus egestas justo eu laoreet dapibus. Cras lobortis eleifend arcu non egestas.")

export function DecodeImage(image: string): Promise<string> {

    return new Promise((resolve, reject) => {

        var NewImage = new Image();
        NewImage.src = image;

        NewImage.onload = function () {

            let Canvas: HTMLCanvasElement = document.getElementById("Render") as HTMLCanvasElement;
            Canvas.width = NewImage.width;
            Canvas.height = NewImage.height;

            let Context: CanvasRenderingContext2D = Canvas.getContext("2d") as CanvasRenderingContext2D;
            Context.imageSmoothingEnabled = false
            Context.drawImage(NewImage, 0, 0);

            return ContinueProsess()

        }

        const ContinueProsess = () => {

            let ImageSize = NewImage.width * NewImage.height;
            console.log(Math.floor(ImageSize / 9) + " chars max! Decode");

            // visualize lost pixels
            let width = Math.floor(NewImage.width / 3);
            let height = Math.floor(NewImage.height / 3);

            let Canvas: HTMLCanvasElement = document.getElementById("Render") as HTMLCanvasElement;
            let Context: CanvasRenderingContext2D = Canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

            let HasFinished = false
            let OutcodedString = ""

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {

                    if (HasFinished) continue;

                    let PixelInfo = new Pixel(0, 0, 0, 0);

                    let CharIndex = (y * width) + x;

                    // get the RBG values of the nabor pixels
                    let PixelData = Context.getImageData((x * 3), (y * 3), 3, 3).data;
                    let Nabors = PixelDataToObject(PixelData);

                    for (let i = 0; i < Nabors.length; i++) {

                        if (i == 4) continue; // skip the middle pixel (the one we are trying to recreate

                        PixelInfo.r += Nabors[i].r;
                        PixelInfo.g += Nabors[i].g;
                        PixelInfo.b += Nabors[i].b;
                    }

                    PixelInfo.r = (Math.floor(PixelInfo.r / 8) > 4 ? Math.floor(PixelInfo.r / 8) - 4 : 0)
                    PixelInfo.g = (Math.floor(PixelInfo.g / 8) > 4 ? Math.floor(PixelInfo.g / 8) - 4 : 0)
                    PixelInfo.b = (Math.floor(PixelInfo.b / 8) > 5 ? Math.floor(PixelInfo.b / 8) - 5 : 0)
                    PixelInfo.a = Nabors[4].a;

                    let CharVector = new Vector3(0, 0, 0);
                    CharVector.x = Nabors[4].r - PixelInfo.r;
                    CharVector.y = Nabors[4].g - PixelInfo.g;
                    CharVector.z = Nabors[4].b - PixelInfo.b;

                    let Char = CharMatrix.find((entry) => entry.position.x == CharVector.x && entry.position.y == CharVector.y && entry.position.z == CharVector.z)?.value;

                    if (Char != ".") OutcodedString += Char;

                    if (Char == ".") HasFinished = true;

                    // decode base64 string
                    if (HasFinished) {
                        console.log(atob(OutcodedString))
                    }


                }
            }

            console.log("done! decode!")
            resolve(atob(OutcodedString))

        }

    })

}

setTimeout(() => {
    let Canvas: HTMLCanvasElement = document.getElementById("Render") as HTMLCanvasElement;
    // grab the image from the canvas and decode it
    //DecodeImage(Canvas.toDataURL() as string);
    //DecodeImage("download (4).png");
}, 500);