/*
    Cost Manager Front End
    Final Project in Front-End Development

    db.js - the version of the library that is compatible with the use of
    modules, and that is the version the React application uses. The logic
    of this version is identical to the logic of the vanilla version that
    is submitted as a separate file.

    This library wraps the use of the local storage and provides the
    application with a simple API for storing cost items and for
    generating reports.
*/

// the four currencies the application supports
const SUPPORTED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

/*
    The default exchange rates. Every rate describes how many units of
    the given currency are equivalent to 1 USD. As an example, the value
    3.4 that belongs to ILS means that ILS 3.4 = USD 1. These rates are
    used until newer rates are fetched from the server side.
*/
const DEFAULT_EXCHANGE_RATES = { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };

// the key under which the most recent exchange rates are cached
const EXCHANGE_RATES_KEY = 'costmanager.exchangerates';

// the exchange rates that are currently in use
let exchangeRates = Object.assign({}, DEFAULT_EXCHANGE_RATES);

/*
    Returns true when the local storage is available. Accessing the local
    storage might throw an exception (e.g. when cookies are blocked).
*/
function isLocalStorageAvailable() {
    try {
        const testKey = 'costmanager.test';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
    } catch (exception) {
        return false;
    }
}

// the storage that is used when the local storage is not available
const memoryStorage = {
    values: {},
    getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : null;
    },
    setItem: function (key, value) {
        this.values[key] = String(value);
    },
    removeItem: function (key) {
        delete this.values[key];
    }
};

// returns the storage the library works with
function getStorage() {
    return isLocalStorageAvailable() ? window.localStorage : memoryStorage;
}

/*
    Takes a currency and returns it in the format the library uses.
    Throws an exception when the given currency is not supported.
*/
function normalizeCurrency(currency) {
    if (typeof currency !== 'string') {
        throw new Error('the currency must be a string');
    }
    const normalized = currency.trim().toUpperCase();
    // EUR is accepted as an alias for the EURO symbol this project uses
    const symbol = normalized === 'EUR' ? 'EURO' : normalized;
    if (SUPPORTED_CURRENCIES.indexOf(symbol) === -1) {
        throw new Error('the currency ' + currency + ' is not supported');
    }
    return symbol;
}

/*
    Converts the given sum from one currency to another one. Every rate
    describes how many units of that currency are equivalent to 1 USD.
    Therefore, the given sum is first converted into USD and only then
    it is converted into the target currency.
*/
function convert(sum, sourceCurrency, targetCurrency, rates) {
    const source = normalizeCurrency(sourceCurrency);
    const target = normalizeCurrency(targetCurrency);
    if (source === target) {
        return sum;
    }
    const table = rates || exchangeRates;
    const sourceRate = Number(table[source]);
    const targetRate = Number(table[target]);
    if (!isFinite(sourceRate) || sourceRate <= 0 || !isFinite(targetRate) || targetRate <= 0) {
        throw new Error('missing exchange rate for ' + source + ' or for ' + target);
    }
    return (sum / sourceRate) * targetRate;
}

// rounds the given number to two digits after the decimal point
function round(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

// returns the key under which the costs of the given database are kept
function getStorageKey(databaseName, databaseVersion) {
    return 'costmanager.' + databaseName + '.v' + databaseVersion;
}

// reads the cost items of the given database from the storage
function readCosts(storageKey) {
    try {
        const text = getStorage().getItem(storageKey);
        if (!text) {
            return [];
        }
        const costs = JSON.parse(text);
        return Array.isArray(costs) ? costs : [];
    } catch (exception) {
        // a broken value in the storage shouldn't break the application
        return [];
    }
}

// writes the given cost items of the given database into the storage
function writeCosts(storageKey, costs) {
    getStorage().setItem(storageKey, JSON.stringify(costs));
}

// returns a unique identifier for a new cost item
function createId() {
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
}

/*
    Takes the exchange rates that were received from the server side and
    keeps only the values that belong to the supported currencies.
*/
function sanitizeRates(rates) {
    if (!rates || typeof rates !== 'object') {
        throw new Error('the exchange rates must be an object');
    }
    const sanitized = {};
    SUPPORTED_CURRENCIES.forEach(function (symbol) {
        // both EURO and EUR are accepted as the key of the EURO rate
        const value = symbol === 'EURO' && rates.EURO === undefined ? rates.EUR : rates[symbol];
        const rate = Number(value);
        if (isFinite(rate) && rate > 0) {
            sanitized[symbol] = rate;
        }
    });
    if (Object.keys(sanitized).length === 0) {
        throw new Error('the exchange rates object doesn\'t include any supported currency');
    }
    return Object.assign({}, DEFAULT_EXCHANGE_RATES, sanitized);
}

/*
    Updates the exchange rates the library works with and keeps them in
    the storage, so that they are available right after a page reload.
*/
function setExchangeRates(rates) {
    exchangeRates = sanitizeRates(rates);
    try {
        getStorage().setItem(EXCHANGE_RATES_KEY, JSON.stringify(exchangeRates));
    } catch (exception) {
        // keeping the rates in the storage is an optimization only
    }
    return Object.assign({}, exchangeRates);
}

// returns a copy of the exchange rates the library currently works with
function getExchangeRates() {
    return Object.assign({}, exchangeRates);
}

// loads the exchange rates that were kept in the storage, if there are any
function loadCachedExchangeRates() {
    try {
        const text = getStorage().getItem(EXCHANGE_RATES_KEY);
        if (text) {
            exchangeRates = sanitizeRates(JSON.parse(text));
        }
    } catch (exception) {
        exchangeRates = Object.assign({}, DEFAULT_EXCHANGE_RATES);
    }
}

/*
    Takes a value and returns it as a number that represents a month in
    the range of 1 to 12. Returns null when the value is not a month.
*/
function toMonth(value) {
    const month = Number(value);
    if (!isFinite(month) || Math.floor(month) !== month || month < 1 || month > 12) {
        return null;
    }
    return month;
}

// takes a value and returns it as a year, or null when it is not a year
function toYear(value) {
    const year = Number(value);
    if (!isFinite(year) || Math.floor(year) !== year || year < 1970 || year > 9999) {
        return null;
    }
    return year;
}

/*
    Takes the properties of a new cost item and returns the object that
    will be kept in the storage. Throws an exception when one of the
    properties is missing or when its value is not valid.
*/
function createCostItem(cost) {
    if (!cost || typeof cost !== 'object') {
        throw new Error('the cost item must be an object');
    }
    const sum = Number(cost.sum);
    if (!isFinite(sum) || sum <= 0) {
        throw new Error('the sum must be a positive number');
    }
    const currency = normalizeCurrency(cost.currency);
    if (typeof cost.category !== 'string' || cost.category.trim() === '') {
        throw new Error('the category must be a non empty string');
    }
    if (cost.description !== undefined && typeof cost.description !== 'string') {
        throw new Error('the description must be a string');
    }
    // the date attached to the cost item is the date on which it was added
    const now = new Date();
    return {
        id: createId(),
        sum: sum,
        currency: currency,
        category: cost.category.trim(),
        description: cost.description === undefined ? '' : cost.description.trim(),
        date: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        }
    };
}

/*
    Takes the name of a database and its version, and returns an object
    that represents that database.
*/
function openCostsDB(databaseName, databaseVersion) {
    if (typeof databaseName !== 'string' || databaseName.trim() === '') {
        throw new Error('the name of the database must be a non empty string');
    }
    const version = Number(databaseVersion === undefined ? 1 : databaseVersion);
    if (!isFinite(version) || version <= 0) {
        throw new Error('the version of the database must be a positive number');
    }
    const storageKey = getStorageKey(databaseName.trim(), version);
    // creating the entry of the database in case it doesn't exist yet
    if (getStorage().getItem(storageKey) === null) {
        writeCosts(storageKey, []);
    }

    return {
        name: databaseName.trim(),
        version: version,

        /*
            Adds a new cost item to the database and returns an object
            that represents the newly added cost item.
        */
        addCost: function (cost) {
            const item = createCostItem(cost);
            const costs = readCosts(storageKey);
            costs.push(item);
            writeCosts(storageKey, costs);
            return {
                id: item.id,
                sum: item.sum,
                currency: item.currency,
                category: item.category,
                description: item.description,
                date: { day: item.date.day }
            };
        },

        /*
            Returns an object that represents a detailed report for a
            specific month and year, in a specific currency. When the
            year and the month are not passed over, the report is
            created for the current month and year.
        */
        getReport: function (currency, year, month) {
            const targetCurrency = normalizeCurrency(currency === undefined ? 'USD' : currency);
            const now = new Date();
            const reportYear = toYear(year) === null ? now.getFullYear() : toYear(year);
            const reportMonth = toMonth(month) === null ? now.getMonth() + 1 : toMonth(month);
            const costs = readCosts(storageKey).filter(function (item) {
                return item.date.year === reportYear && item.date.month === reportMonth;
            });
            let total = 0;
            const reportCosts = costs.map(function (item) {
                total += convert(item.sum, item.currency, targetCurrency);
                return {
                    sum: item.sum,
                    currency: item.currency,
                    category: item.category,
                    description: item.description,
                    date: { day: item.date.day }
                };
            });
            return {
                year: reportYear,
                month: reportMonth,
                costs: reportCosts,
                total: { currency: targetCurrency, sum: round(total) }
            };
        },

        /*
            Returns an array that holds every cost item in the database.
            Every item includes the identifier that allows removing it.
        */
        getAllCosts: function () {
            return readCosts(storageKey);
        },

        /*
            Removes the cost item with the given identifier and returns
            true when a cost item was indeed removed.
        */
        deleteCost: function (id) {
            const costs = readCosts(storageKey);
            const remaining = costs.filter(function (item) {
                return item.id !== id;
            });
            writeCosts(storageKey, remaining);
            return remaining.length !== costs.length;
        },

        /*
            Returns an array of objects that hold the total costs of each
            one of the categories in the given month and year, in the
            given currency. This report is the one the pie chart shows.
        */
        getCategoriesReport: function (currency, year, month) {
            const report = this.getReport(currency, year, month);
            const totals = {};
            report.costs.forEach(function (item) {
                const value = convert(item.sum, item.currency, report.total.currency);
                totals[item.category] = (totals[item.category] || 0) + value;
            });
            return Object.keys(totals).map(function (category) {
                return { category: category, sum: round(totals[category]) };
            }).sort(function (first, second) {
                return second.sum - first.sum;
            });
        },

        /*
            Returns an array of twelve objects that hold the total costs
            of each one of the months in the given year, in the given
            currency. This report is the one the bar chart shows.
        */
        getYearlyReport: function (currency, year) {
            const targetCurrency = normalizeCurrency(currency === undefined ? 'USD' : currency);
            const now = new Date();
            const reportYear = toYear(year) === null ? now.getFullYear() : toYear(year);
            const totals = [];
            for (let month = 1; month <= 12; month += 1) {
                const report = this.getReport(targetCurrency, reportYear, month);
                totals.push({ month: month, sum: report.total.sum });
            }
            return totals;
        },

        // removes every cost item from the database
        clear: function () {
            writeCosts(storageKey, []);
        },

        // updates the exchange rates the library works with
        setExchangeRates: setExchangeRates,

        // returns the exchange rates the library currently works with
        getExchangeRates: getExchangeRates
    };
}

// reading the exchange rates that were kept during a previous run
loadCachedExchangeRates();

// the API of the library, exported both as named exports and as a default
// export, so that it can be used in either way inside the application
export {
    openCostsDB,
    setExchangeRates,
    getExchangeRates,
    convert,
    SUPPORTED_CURRENCIES,
    DEFAULT_EXCHANGE_RATES
};

const db = {
    openCostsDB,
    setExchangeRates,
    getExchangeRates,
    convert,
    SUPPORTED_CURRENCIES,
    DEFAULT_EXCHANGE_RATES
};

export default db;
