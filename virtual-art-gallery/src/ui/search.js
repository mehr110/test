import _ from 'lodash';
import EventEmitter from 'eventemitter3';

import * as api from '../api';
import {ordinal} from '../utils';

const searchUI = document.querySelector('#search-ui');
const queryText = document.querySelector('#query');
const sendButton = document.querySelector('#send-query');
const closeButton = document.querySelector('#search-close');
const filterResetButton = document.querySelector('#filter-reset');
const results = document.querySelector('#results');
const container = document.querySelector('#search-body');
const totalText = document.querySelector('#total-results');

const nextPageThreshold = 150;

let currentPage = 1;
let searching = false;

const loadingHtml = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`

const dropdownFilterNames = [
    'type',
    'artist',
    'period',
    'origin',
    'medium',
    'technique'
];

const dropdownFilters = {};
dropdownFilterNames.forEach(name => {
    dropdownFilters[name] = {
        selector: document.querySelector('#filter-' + name),
        value: undefined,
    };
});

dropdownFilters.type.value = 'painting';

dropdownFilters.period.formatter = (century) => {
    let bc = false;
    if(century < 0) {
        bc = true;
        century *= -1;
    }
    return `${ordinal(century)} century${bc?' B.C.':''}`;
};

function makeTile({title, author, year, thumbnail}) {
    const ele = document.createElement('div');
    ele.className = 'result-tile';

    const thumbSpace = document.createElement('div');
    thumbSpace.className = 'result-thumb-holder';
    ele.appendChild(thumbSpace);

    thumbSpace.style.backgroundImage = `url('${thumbnail}')`;
    thumbSpace.addEventListener('click', () => {
        searchExport.emit("selected", {
            title,
            url: thumbnail
        });
    });

    // const image = document.createElement('img');
    // image.className = 'result-thumb';
    // image.src = thumbnail;
    // thumbSpace.appendChild(image);
    

    const titleText = document.createElement('h4');
    titleText.className = 'result-title';
    titleText.textContent = title;
    ele.appendChild(titleText);

    const subtitle = document.createElement('p');
    subtitle.className = "result-subtitle";
    subtitle.textContent = `${author}, ${year}`;
    ele.appendChild(subtitle);

    return ele;
}

function updateFilters(facets) {
    _.forEach(dropdownFilters, (filter, name) => {
        const newOptions = [
            new Option("Any", "__any__", false, false)
        ];
        if(filter.value !== undefined) {
            newOptions.push(new Option(filter.value, filter.value, false, false));
        } else {
            const facet = _.find(facets, f => f.name === name);
            if(facet != null) {
                const extraOptions = facet
                .facets
                .slice(0, 10)
                .map(({key, value}) => {
                    let text = key;
                    if(filter.formatter != null) {
                        text = filter.formatter(text);
                    }
                    return new Option(`${text} (${value} artwork${value !== 1?'s':''})`, key, false, false);
                });
                newOptions.push(...extraOptions);
            }
            newOptions[0].selected = true;
        }
        while(filter.selector.item(0)) {
            filter.selector.remove(0);
        }
        newOptions.forEach(o => filter.selector.add(o));
        filter.selector.selectedIndex = filter.value === undefined ? 0 : 1;
    });
}

function search(replace) {
    if(replace) {
        results.innerHTML = loadingHtml;    
    } else {
        const spacer = _.find(results.childNodes, e => e.className === "spacer");
        spacer.innerHTML = loadingHtml; 
    }

    searching = true;

    const filters = _
    .chain(dropdownFilters)
    .mapValues(f => f.value)
    .pickBy(v => v !== undefined)
    .value();

    api.searchArtworks(queryText.value, {
        page: currentPage,
        filters 
    })
    .then(({tiles, count, facets}) => {
        if(replace) {
            results.innerHTML = '';
        }
        tiles
        .map(makeTile)
        .forEach(tile => results.appendChild(tile));

        if(replace) {
            const spacer = document.createElement('div');
            spacer.className = 'spacer';
            results.appendChild(spacer);    
        } else {
            const spacer = _.find(results.childNodes, e => e.className === "spacer");
            spacer.innerHTML = '';
            results.removeChild(spacer);
            results.appendChild(spacer);
        }

        totalText.textContent = `Found ${count} images`;
        updateFilters(facets);
        searching = false;
    })
    .catch(e => {
        console.log("Error performing search query", e);
        currentPage--;
        searching = false;
    });
}

function nextPage() {
    currentPage++;
    search(false);
}

function newSearch() {
    currentPage = 1;
    search(true);
}

function disappearHandler() {
    searchUI.removeEventListener('transitionend', disappearHandler);
    searchUI.style.visibility = "hidden";
    const vrButton = document.querySelector('.a-enter-vr-button');
    if(vrButton) {
        vrButton.style.visibility = "visible";
    }
}

class Search extends EventEmitter {
    init() {
        queryText.addEventListener('keyup', e => {
            if(e.keyCode === 13) {
                e.preventDefault();
                newSearch();
            }
        });

        sendButton.addEventListener('click', newSearch);

        closeButton.addEventListener('click', () => this.closeSearch());

        filterResetButton.addEventListener('click', () => {
            _.forEach(dropdownFilters, filter => {
                delete filter.value;
            });
            newSearch();
        });

        container.addEventListener('scroll', () => {
            if(searching) {
                return;
            }
            if(container.scrollTop + container.offsetHeight >= container.scrollHeight - nextPageThreshold) {
                nextPage();
            }
        });

        _.forEach(dropdownFilters, filter => {
            const {selector} = filter;
            selector.addEventListener('change', () => {
                if(selector.value === "__any__") {
                    delete filter.value;
                } else {
                    filter.value = selector.value;
                }
                newSearch();
            });
        });
    }

    openSearch() {
        searchUI.style.visibility = "visible";
        searchUI.style.opacity = 1;
        const vrButton = document.querySelector('.a-enter-vr-button');
        if(vrButton) {
            vrButton.style.visibility = "hidden";
        }
        searchUI.removeEventListener('transitionend', disappearHandler);
        newSearch();
    }

    closeSearch() {
        searchUI.style.opacity = 0;
        searchUI.addEventListener('transitionend', disappearHandler);
    }
}
const searchExport = new Search();
export default searchExport;
