/*
    Cost Manager Front End
    Final Project in Front-End Development

    constants.js - the values that are shared by the components of the
    application.
*/

// the name and the version of the database this application works with
export const DATABASE_NAME = 'costsdb';
export const DATABASE_VERSION = 1;

// the categories the user can choose when adding a new cost item
export const CATEGORIES = [
    'Food',
    'Transportation',
    'Housing',
    'Health',
    'Education',
    'Entertainment',
    'Clothing',
    'Utilities',
    'Other'
];

// the names of the months, ordered according to their numbers
export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// the colors the pie chart uses, one color for each slice
export const CHART_COLORS = [
    '#1976d2',
    '#e53935',
    '#43a047',
    '#fb8c00',
    '#8e24aa',
    '#00acc1',
    '#fdd835',
    '#6d4c41',
    '#546e7a'
];

/*
    Returns an array of the years the user can choose. The array includes
    the current year, the five years that came before it and the next year.
*/
export function getSelectableYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= currentYear - 5; year -= 1) {
        years.push(year);
    }
    return years;
}

// returns the name of the month with the given number (1 to 12)
export function getMonthName(month) {
    return MONTH_NAMES[month - 1];
}
