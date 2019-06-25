import {changePicture} from '../picture';

import {randomArtwork} from '../api';

import search from './search';



const searchButton = document.querySelector('#picture-search');
const randomButton = document.querySelector('#picture-random');


export function init() {
    searchButton.addEventListener('click', () => {
        search.openSearch();
        search.once('selected', ({url}) => {
            changePicture(url);
            search.closeSearch();
        });
    });

    randomButton.addEventListener('click', () => {
        randomArtwork().then(({url}) => {
            changePicture(url);
        });
    });

    randomArtwork().then(({url}) => {
        changePicture(url);
    });
}