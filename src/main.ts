import { EncodeImage, DecodeImage } from "./ashCode";

// encode 
let FileInputEncode = document.getElementById("FileInputEncode") as HTMLInputElement;
let FileInputDecode = document.getElementById("FileInputDecode") as HTMLInputElement;

let EncodeButton = document.getElementById("EncodeButton") as HTMLButtonElement;
let DecodeButton = document.getElementById("DecodeButton") as HTMLButtonElement;

let PreviewImage = document.getElementById("PreviewImage") as HTMLImageElement;

var EncodeImageString = ""
var DecodeImageString = ""

FileInputEncode.addEventListener("change", () => {
    
    if (FileInputEncode == undefined || FileInputEncode.files == undefined) return;

    let File = FileInputEncode.files[0];
    let Reader = new FileReader();

    Reader.onload = (e) => {
        PreviewImage.src = Reader.result as string;
        EncodeImageString = Reader.result as string;
    }

    Reader.readAsDataURL(File);

})

let EncodeValue = document.getElementById("EncodeText") as HTMLTextAreaElement

EncodeButton.addEventListener("click", () => {

    EncodeImage(EncodeImageString, EncodeValue?.value).then((result) => {
        PreviewImage.src = result;
        alert("Done!\nImage on the left is now encoded with your text!\nRight click to save it")
    })

})

// decode

FileInputDecode.addEventListener("change", () => {

    if (FileInputDecode == undefined || FileInputDecode.files == undefined) return;

    let File = FileInputDecode.files[0];
    let Reader = new FileReader();

    Reader.onload = (e) => {
        PreviewImage.src = Reader.result as string;
        DecodeImageString = Reader.result as string;
    }

    Reader.readAsDataURL(File);

})

DecodeButton.addEventListener("click", () => {

    DecodeImage(DecodeImageString).then((result) => {
        let area = document.getElementById("DecodedText") as HTMLTextAreaElement
        area.value = result;
    })

})