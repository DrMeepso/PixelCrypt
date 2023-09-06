import { EncodeImage, DecodeImage } from "./ashCode";

// encode 
let FileInput = document.getElementById("FileInputPicker") as HTMLInputElement;

let PickerButton = document.getElementById("FilePickerButton") as HTMLButtonElement;
let PickerText = document.getElementById("FilePickerLabel") as HTMLLabelElement;

let EncodeButton = document.getElementById("EncodeButton") as HTMLButtonElement;
let DecodeButton = document.getElementById("DecodeButton") as HTMLButtonElement;

let PreviewImage = document.getElementById("PreviewImage") as HTMLImageElement;

var ImageString = ""

PickerButton.addEventListener("click", () => {
    FileInput.click();
})

FileInput.addEventListener("change", () => {

    if (FileInput == undefined || FileInput.files == undefined) return;

    let File = FileInput.files[0];
    let Reader = new FileReader();

    Reader.onload = (e) => {
        PreviewImage.src = Reader.result as string;
        ImageString = Reader.result as string;

        PickerText.innerText = File.name;

    }

    Reader.readAsDataURL(File);

})

document.ondragover = (e) => {
    e.preventDefault();
}

document.ondrop = (e: any) => {
    e.preventDefault();
    let file = e.dataTransfer?.files[0];
    let reader = new FileReader();
    reader.onload = (e: any) => {
        PreviewImage.src = reader.result as string;
        ImageString = reader.result as string;

        PickerText.innerText = file.name;
    }
    reader.readAsDataURL(file as Blob);
}

// encode

let EncodeValue = document.getElementById("EncodeText") as HTMLTextAreaElement

EncodeButton.addEventListener("click", () => {

    EncodeImage(ImageString, EncodeValue?.value).then((result) => {
        PreviewImage.src = result;
        alert("Done!\nImage on the left is now encoded with your text!\nRight click to save it")
        ImageString = result;
    })

})

// decode

DecodeButton.addEventListener("click", () => {

    DecodeImage(ImageString).then((result) => {
        let area = document.getElementById("DecodedText") as HTMLTextAreaElement
        area.value = result;
        ImageString = result;
    })

})