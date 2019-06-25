/* global THREE */
import EventEmitter from 'eventemitter3';

import {EPS} from './math';
import {placeOnWall, wallAtPoint} from './wall-utils';

const cursor = document.querySelector('#cursor');
const placer = document.querySelector('#placement-box');

let paused = false; // Raycaster doesn't like it if we remove its events for some reason

let currentWall = null;
let placing = false;
let placingInitial = null;
let placingInitialLocal = null;
let placingCurrent = null;
let placingMiddle = null;
let placingWidth = 0;
let placingHeight = 0;

class WallSelector extends EventEmitter {
    pause() {
        paused = true;
    }

    resume() {
        paused = false;
    }

    init() {
        cursor.components['raycaster'].refreshObjects();
    }
}

const selector = new WallSelector();

export default selector;

cursor.addEventListener('mousedown', e => {
    if(paused) {
        // alert('[wall-selector] mousedown - paused: ' + paused);
        return;
    }
    if(e.detail.intersection == null) {
        // alert('[wall-selector] mousedown - e.detail.intersection: ' + e.detail.intersection);
        return;
    }

    const point = e.detail.intersection.point;

    const wall = e.detail.intersectedEl;

    if(wall !== undefined) {
        console.log(wall.object3D.matrix);
        currentWall = wall;
        placing = true;
        placingInitial = point;

        const objectSpace = new THREE.Matrix4();
        objectSpace.getInverse(wall.object3D.matrix);
        placingInitialLocal = point.clone().applyMatrix4(objectSpace);
        // const norm = wallNormal(wall);
        // const offset = norm.multiplyScalar(0.01).add(point);
        // picture.setAttribute('rotation', wall.getAttribute('rotation'));
        // picture.setAttribute('position', offset);
    }
});

cursor.addEventListener('mousemove', e => {
    if(paused) {
        // alert('[wall-selector] paused: ' + paused);
        return;
    }
    if(placing === false) {
        // alert('[wall-selector] placing: ' + placing);
        return;
    }
    if(e.detail.intersection == null) {
        // alert('[wall-selector] e.detail.intersection:' + e.detail.intersection);
        return;
    }

    const point = e.detail.intersection.point;

    const wall = e.detail.intersectedEl;

    if(wall !== undefined && wall === currentWall) {
        if(point.distanceTo(placingInitial) > EPS) {
            if(placingCurrent === null) {
                placer.setAttribute('visible', true);
                selector.emit("placing");
            }
            placingCurrent = point;

            const objectSpace = new THREE.Matrix4();
            objectSpace.getInverse(wall.object3D.matrix);

            const currentLocal = point.clone().applyMatrix4(objectSpace);

            placingWidth = Math.abs(currentLocal.x - placingInitialLocal.x);
            placingHeight = Math.abs(currentLocal.y - placingInitialLocal.y);

            placingMiddle = point.clone().add(placingInitial).divideScalar(2);

            placeOnWall(wall, placer, placingMiddle, placingWidth, placingHeight);
        }
    }
});

cursor.addEventListener('mouseup', () => {
    // alert('mouse up')
    if(paused) {
        return;
    }
    if(placing === false) {
        return;
    }
    placing = false;
    placer.setAttribute('visible', false);    

    if(placingCurrent !== null) {
        selector.emit('placed', {
            wall: currentWall,
            width: placingWidth,
            height: placingHeight,
            middle: placingMiddle
        });
    }

    placingCurrent = currentWall = placingMiddle = placingInitial = placingInitialLocal = null;
});