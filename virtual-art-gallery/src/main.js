/* global io3d */

import _ from 'lodash';

import wallSelector from './wall-selector';
import {iterateAframeComponents} from './utils';
import {setUpModes} from './ui/modes';
import searchUI from './ui/search';
import * as helpUI from './ui/help';
import * as pictureButtons from './ui/picture-buttons';
import * as picture from './picture';
import * as switchUI from './ui/scene-switch';


const defaultScene = 'babed27c-1573-44c9-8a93-9b4fe3745466';

if(window.location.hash === '') {
    window.location.hash = defaultScene;
}
window.addEventListener('hashchange', () => {
    window.location.reload();
});

const sceneId = window.location.hash.slice(1);

const scene = document.querySelector('a-scene');

io3d.scene.getStructure(sceneId)
.then(structure => io3d.scene.getAframeElementsFromSceneStructure(structure))
.then(elements => {
    const ioScene = _.find(elements, e => e.className === "io3d-scene");
    scene.appendChild(ioScene);

    ioScene.addEventListener('loaded', () => {
        ioScene.setAttribute('rotation', '0 0 0');
        iterateAframeComponents(ioScene, (ele) => {
            if(ele.hasAttribute('io3d-wall')) {
                ele.classList.add('clickable');
            }
        });
        wallSelector.init();
        picture.init();
        searchUI.init();
        helpUI.init();
        pictureButtons.init();
        switchUI.init();
        setUpModes(); 

    });
});