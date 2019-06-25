
const switchUI = document.querySelector('#scene-select-container');
const sceneIdBox = document.querySelector('#scene-id');
const showSwitchUIButton = document.querySelector('#button-scene-switch-show');
const switchButton = document.querySelector('#sene-switch');
const closeButton = document.querySelector('#scene-switch-close');


export function init() {
    showSwitchUIButton.addEventListener('click', () => {
        switchUI.style.visibility = 'visible';
    });

    closeButton.addEventListener('click', () => {
        switchUI.style.visibility = 'hidden';
    });

    switchButton.addEventListener('click', () => {
        const url = sceneIdBox.value;

        const match = url.match(/modelResourceId=([^&]*)(?:$|&)/);

        if(match == null || match[1] == null) {
            alert("Invalid URL!");
        }

        window.location.hash = match[1];
        switchUI.style.visibility = 'hidden';
    });
}