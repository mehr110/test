const helpButton = document.querySelector('#button-help');
const closeButton = document.querySelector('#help-close');
const helpOverlay = document.querySelector('#help');

export function init() {

    helpButton.addEventListener('click', () => {
        helpOverlay.style.visibility = 'visible';
    });

    closeButton.addEventListener('click', () => {
        helpOverlay.style.visibility = 'hidden';
    });

    if(localStorage.getItem("helpShown") === null) {
        localStorage.setItem("helpShown", "yes");
        helpOverlay.style.visibility = 'visible';
    }
}
