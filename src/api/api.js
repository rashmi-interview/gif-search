const BASE_URL = 'https://api.giphy.com/v1';

function api(url, method, data) {
    return fetch(url, {
        method: method,
        body: data ? JSON.stringify(data): null,
    }).then(response => response.json())
}


export function get(url) {
    return api(`${BASE_URL}/${url}`, 'GET'); 
}