Cost Manager Front End
Final Project in Front-End Development
======================================

What This Project Includes
--------------------------
A cost manager application that keeps the cost items in the local storage of
the web browser. The user can add cost items, get a detailed report for a
specific month and year, get a pie chart of the costs according to the
categories, and get a bar chart of the costs in each one of the twelve months
of a year. Every report and every chart can be shown in one of the four
supported currencies: USD, ILS, GBP and EURO.

The Files of The Project
------------------------
index.html                       the HTML document of the application
vite.config.js                   the configuration of the build tool
render.yaml                      the configuration that deploys the project
public/rates.json                the static JSON file that holds the exchange
                                 rates, deployed together with the application
src/main.jsx                     the entry point of the React application
src/App.jsx                      the main component
src/lib/db.js                    the db library, the version that is
                                 compatible with the use of modules
src/lib/exchangeRates.js         retrieves the exchange rates using the Fetch
                                 API and keeps the URL the user specified
src/lib/constants.js             the values that are shared by the components
src/components/AddCostForm.jsx   the screen that adds a new cost item
src/components/ReportView.jsx    the screen that shows the detailed report
src/components/PieChartView.jsx  the screen that shows the pie chart
src/components/BarChartView.jsx  the screen that shows the bar chart
src/components/SettingsView.jsx  the screen that holds the settings
src/components/Selectors.jsx     the currency, month and year selectors
vanilla/db.js                    the db library, the vanilla version. This is
                                 the file that is submitted separately
vanilla/test.html                the HTML document that tests the vanilla
                                 version of the db library

Running The Project
-------------------
npm install
npm run dev        runs the project during the development
npm run build      creates the files of the production version in dist
npm run preview    runs the production version

Testing The Vanilla Version of db.js
------------------------------------
Open the file vanilla/test.html in Google Chrome (it is recommended to serve
the vanilla folder through a simple HTTP server) and open the console of the
developer tools in order to see the output of the test.

The Currency Exchange Rates
---------------------------
The application retrieves the exchange rates from the server side using the
Fetch API. When the user doesn't specify a URL address in the settings screen,
the application retrieves the rates from rates.json, the static JSON file that
is deployed together with the application. The user can specify a different
URL address in the settings screen, and the reply of that URL address should
be a JSON of the following structure:

{"USD":1, "GBP":0.6, "EURO":0.7, "ILS":3.4}

Every rate describes how many units of that currency are equivalent to USD 1.
The db library includes the same rates as default values, and it works with
them when the retrieval from the server side fails.

Deployment
----------
The project is deployed on render.com as a static site. The build command is
npm install && npm run build, and the folder that is published is dist.
