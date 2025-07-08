const axios = require('axios');
const querystring = require('querystring');

async function getHtml(req) {
    if (req.body.provider === undefined || req.body.terms === undefined || req.body.userid === undefined){
        return "Not enough information provided";
    }

    const allowedPaths = ['/search/v2/']; // whitelist paths
    let provider = req.body.provider;

    if (!allowedPaths.includes(provider)) {
        return "Invalid search provider";
    }

    const terms = req.body.terms;
    const userid = req.body.userid;

    await sleep(1000); // simulate long search

    const theUrl = 'http://localhost:3000' + provider + '?userid=' + userid + '&terms=' + terms;
    const result = await callAPI('GET', theUrl, false);
    return result;
}

async function callAPI(method, url, data){
    let noResults = 'No results found!';
    let result;

    switch (method){
        case "POST":
            if (data) {
                result = await axios.post(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.post(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        case "PUT":
            if (data) {
                result = await axios.put(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.put(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        default:
            if (data)
                url = url+'?'+querystring.stringify(data);

            result = await axios.get(url)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    return noResults;
                });
    }

    return result ? result : noResults;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { html: getHtml };