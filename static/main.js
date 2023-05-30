//========================================================================
// Arrastrar y soltar
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// listeners de eventos
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
    // prevent default behaviour
    e.preventDefault();
    e.stopPropagation();

    fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
    // handle file selecting
    var files = e.target.files || e.dataTransfer.files;
    fileDragHover(e);
    for (var i = 0, f; (f = files[i]); i++) {
        previewFile(f);
    }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
var predResult = document.getElementById("pred-result");
var loader = document.getElementById("loader");
var formData = new FormData();

//========================================================================
// Main button events
//========================================================================

function submitImage() {
    // action for the submit button
    console.log("submit");

    if (!imageDisplay.src || !imageDisplay.src.startsWith("data")) {
        window.alert("Porfavor seleccione una imagen.");
        return;
    }

    loader.classList.remove("hidden");
    imageDisplay.classList.add("loading");

    // create a new FormData object
    formData.append("image", dataURItoBlob(imageDisplay.src));

    // send the FormData object to the backend
    classifyImage(formData);

}

function dataURItoBlob(dataURI) {
    // convert a data URI to a Blob object
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


function clearImage() {
    formData = new FormData();

    // reset selected files
    fileSelect.value = "";

    // remove image sources and hide them
    imagePreview.src = "";
    imageDisplay.src = "";
    predResult.innerHTML = "";

    hide(imagePreview);
    hide(imageDisplay);
    hide(loader);
    hide(predResult);
    show(uploadCaption);

    imageDisplay.classList.remove("loading");
    clear();
}

function previewFile(file) {
    var allowed_extensions = new Array("jpg", "jpeg");
    var file_extension = file.name.split('.').pop().toLowerCase();
    if (!allowed_extensions.includes(file_extension)) {
        window.alert("Archivo no válido. Formatos permitidos: jpg, jpeg.");
        return;
    } else {
        console.log('Nombre del archivo: ' + file.name);
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            imagePreview.src = URL.createObjectURL(file);

            show(imagePreview);
            hide(uploadCaption);

            predResult.innerHTML = "";
            imageDisplay.classList.remove("loading");

            displayImage(reader.result, "image-display");
        }
    }
}

//========================================================================
// Helper functions
//========================================================================

function classifyImage(image) {
    fetch("/clasificar", {
        method: "POST",
        body: formData
    })
        .then(resp => {
            if (resp.ok) {
                resp.text().then(data => {
                    displayResult(data);
                });
            }
        })

        .catch(err => {
            console.log("Ocurrió un error", err.message);
            window.alert("Algo salió mal :(");
        });
}

function clear() {
    fetch("/limpiar", {
        method: "POST",
    })
        .then(resp => {
            if (resp.ok) {
                console.log("Limpieza realizada correctamente");
            } else {
                console.log("Error en la limpieza");
            }
        })
        .catch(err => {
            console.log("Ocurrió un error", err.message);
        });
}

function displayImage(image, id) {
    // display image on given id <img> element
    let display = document.getElementById(id);
    display.src = image;
    show(display);
}

function displayResult(data) {
    // display the result
    //imageDisplay.classList.remove("loading");
    console.log(data)
    hide(loader);
    predResult.innerHTML = data;
    show(predResult);
}

function hide(el) {
    // hide an element
    el.classList.add("hidden");
}

function show(el) {
    // show an element
    el.classList.remove("hidden");
}