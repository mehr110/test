import * as camera from '../camera';
import wallSelector from '../wall-selector';

const modes = {
    camera: {
        button: document.querySelector('#mode-camera'),
        iconActive: 'assets/icon-camera-active.png',
        iconInactive: 'assets/icon-camera.png',
        turnOn: () => {
            camera.resume();
        },
        turnOff: () => {
            camera.pause();
        }
    },
    place: {
        button: document.querySelector('#mode-place'),
        iconActive: 'assets/icon-place-active.png',
        iconInactive: 'assets/icon-place.png',
        turnOn: () => {
            wallSelector.resume();
        },
        turnOff: () => {
            wallSelector.pause();
        }
    }
};

const defaultMode = "camera";
let currentMode = null;

function setMode(mode) {
    if(mode === currentMode) {
        return;
    }
    if(modes[mode] === undefined) {
        console.log("Unknown mode: ", mode);
        return;
    }
    if(currentMode != null) {
        modes[currentMode].turnOff();
        modes[currentMode].button.src = modes[currentMode].iconInactive;
    }

    currentMode = mode;
    modes[mode].turnOn();
    modes[mode].button.src = modes[mode].iconActive;
}

export function setUpModes() {
    Object.keys(modes)
    .forEach(mode => {
        modes[mode].turnOff();
        modes[mode].button.addEventListener('click', () => {
            setMode(mode);
        });
    });

    setMode(defaultMode);
}