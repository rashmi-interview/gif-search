import { get } from "../api/api";
const KEY = 'p9e6G6LWY0oRkM5oqhilmyClfTeJzb4x';

export function getAllGifs(searchText) {
    let url='/gifs/search';
    let qs = `api_key=${KEY}&q=${searchText}`;
    return get(`${url}?${qs}`);
}