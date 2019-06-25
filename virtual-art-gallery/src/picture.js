import selector from './wall-selector';
import {placeOnWall} from './wall-utils';

let picture = document.querySelector('#picture');

const pictureSource = document.querySelector('#picture-source');
const scene = document.querySelector('a-scene');


let pictureWall = null;
let pictureWidth = 0;
let pictureHeight = 0;
let pictureFittedWidth = 0;
let pictureFittedHeight = 0;
let pictureMiddle = null;
let pictureAspect = 1;

function placePicture() {

    if(pictureHeight * pictureAspect > pictureWidth) { // Fit width
        pictureFittedWidth = pictureWidth;
        pictureFittedHeight = pictureWidth / pictureAspect;
    } else { // Fit height
        pictureFittedWidth = pictureHeight * pictureAspect;
        pictureFittedHeight = pictureHeight;
    }

    picture.setAttribute('visible', true);
    placeOnWall(pictureWall, picture, pictureMiddle, pictureFittedWidth, pictureFittedHeight);
}

export function changePicture(src) {
    pictureSource.crossOrigin = "";
    pictureSource.src = src;
}

export function init() {
    selector.on("placing", () => {
        picture.setAttribute('visible', false);
    });

    selector.on("placed", (opts) => {
        const {wall, width, height, middle} = opts;
        pictureWall = wall;
        pictureWidth = width;
        pictureHeight = height;
        pictureMiddle = middle;

        placePicture();
    });

    pictureSource.addEventListener('load', () => {
        pictureAspect = pictureSource.width / pictureSource.height;
        const visible = picture.getAttribute('visible');
        scene.removeChild(picture);
        picture = document.createElement('a-image');
        picture.setAttribute('src', '#picture-source');
        picture.setAttribute('visible', visible);
        scene.appendChild(picture);

        if(pictureWall !== null) {
            placePicture();
        }
    });
}