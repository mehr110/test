import request from 'superagent';
import _ from 'lodash';

// For a demo it won't matter, but there's no real way to hide this without a backend
const baseUrl = "https://www.rijksmuseum.nl/api/en/";
const key = "Ah7VuM8F";

function get(path) {
    return request
    .get(baseUrl + path)
    .query({
        key,
        format: 'json'
    });
}

const searchFilterKeys = {
    type: "type",
    artist: "principalMaker",
    period: "f.dating.period",
    origin: "place",
    medium: "material",
    technique: "technique"
};

const resultFilterKeys = Object.assign({},
    _.invert(searchFilterKeys),
    {
        "dating.period": "period",

    }
);


export function searchArtworks(text, {
    page,
    filters=undefined
}) {
    let req = get('collection')
    .query({
        q: text,
        p: page,
        imgonly: true,
    });

    if(typeof filters === "object") {
        req = req.query(_.mapKeys(filters, (v, k) => searchFilterKeys[k]));
    }

    return req.then(res => {
        const data = res.body;

        const tiles = data.artObjects.map(art => {
            return {
                title: art.title,
                author: art.principalOrFirstMaker,
                year: art.longTitle.split(',')[2].trim(), // Not entirely convenient, that
                thumbnail: art.webImage.url,
            };
        });

        data.facets.forEach(facet => {
            facet.name = resultFilterKeys[facet.name];
        });

        return {
            count: data.count,
            tiles,
            facets: data.facets,
        };
    });
    
}

const randomArtworks = 4000;

export function randomArtwork() {
    const num = Math.floor(randomArtworks * Math.random());
    const page = 1 + Math.floor(num / 10);
    const idInPage = num % 10;

    return get('collection')
    .query({
        type: 'painting',
        p: page,
        imgonly: true,
    })
    .then(res => {
        const data = res.body;

        const id = Math.min(idInPage, data.artObjects.length);
        const art = data.artObjects[id];
        return {
            title: art.title,
            url: art.webImage.url
        };
    });
}