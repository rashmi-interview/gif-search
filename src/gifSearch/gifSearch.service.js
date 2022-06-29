import { get } from "../api/api";
const KEY = 'p9e6G6LWY0oRkM5oqhilmyClfTeJzb4x';

export function getAllGifs(searchText, offset, limit) {
    let url='/gifs/search';
    let qs = `api_key=${KEY}&q=${searchText}`;
    if(offset) qs = `${qs}&offset=${offset}`;
    if(limit) qs = `${qs}&limit=${limit}`;

    return get(`${url}?${qs}`);
}