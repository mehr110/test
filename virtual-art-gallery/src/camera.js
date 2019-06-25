const camera = document.querySelector('#cam');

export function resume() {
    camera.components['orbit-controls'].play();
}

export function pause() {
    camera.components['orbit-controls'].pause();
}