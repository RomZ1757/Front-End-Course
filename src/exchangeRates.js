/*
    Cost Manager Front End
    Final Project in Front-End Development

    exchangeRates.js - the module that retrieves the currency exchange rates
    from the server side using the Fetch API, and that keeps the URL address
    the user can specify through the settings screen.
*/

import { setExchangeRates } from './db.js';

// the key under which the URL the user specified is kept
const RATES_URL_KEY = 'costmanager.ratesurl';

/*
    Returns the URL address of the exchange rates the application uses when
    the user doesn't specify a URL address of his own. That URL address
    belongs to a static JSON file that is deployed together with this
    application, and therefore it is always available on the web.
*/
export function getDefaultRatesUrl() {
    return new URL('rates.json', document.baseURI).href;
}

// returns the URL address from which the exchange rates should be retrieved
export function getRatesUrl() {
    try {
        const url = window.localStorage.getItem(RATES_URL_KEY);
        return url && url.trim() !== '' ? url.trim() : getDefaultRatesUrl();
    } catch (exception) {
        return getDefaultRatesUrl();
    }
}

// returns true when the user specified a URL address of his own
export function hasCustomRatesUrl() {
    try {
        const url = window.localStorage.getItem(RATES_URL_KEY);
        return Boolean(url && url.trim() !== '');
    } catch (exception) {
        return false;
    }
}

/*
    Keeps the URL address the user specified. Passing over an empty string
    removes that URL address, and the application goes back to using the
    default one.
*/
export function setRatesUrl(url) {
    try {
        if (!url || url.trim() === '') {
            window.localStorage.removeItem(RATES_URL_KEY);
        } else {
            window.localStorage.setItem(RATES_URL_KEY, url.trim());
        }
    } catch (exception) {
        throw new Error('the URL address couldn\'t be saved in the local storage');
    }
}

/*
    Retrieves the exchange rates from the server side using the Fetch API,
    updates the rates the db library works with, and returns them. When the
    URL address is not passed over, the one the user specified is used, and
    when the user didn't specify one, the default one is used.
*/
export async function fetchExchangeRates(url) {
    const address = url && url.trim() !== '' ? url.trim() : getRatesUrl();
    const response = await fetch(address, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('the server responded with the status ' + response.status);
    }
    const rates = await response.json();
    // the db library keeps the rates and uses them when creating the reports
    return setExchangeRates(rates);
}
