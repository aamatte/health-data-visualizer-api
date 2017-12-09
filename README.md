# County health data API

This API is meant to provide information about several health indicators in every county of the United States. The initial data was obtained from the [Center for Disease Control and Prevention](https://www.cdc.gov/diabetes/data/countydata/countydataindicators.html).

## Table of contents

- [Build status](#build-status)
- [Technology used](#technology-used)
- [Features](#features)
- [Getting started](#getting-started)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Tests](#tests)

## Build status
Build status of continus integration i.e. travis, appveyor etc. Ex. - 

[![Build Status](https://travis-ci.org/akashnimare/foco.svg?branch=master)](https://travis-ci.org/akashnimare/foco)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/akashnimare/foco?branch=master&svg=true)](https://ci.appveyor.com/project/akashnimare/foco/branch/master)

 
## Technology used

- [Express.js](https://expressjs.com/) as the web framework.
- ES2017+ support with [Babel](https://babeljs.io/).
- Automatic polyfill requires based on environment with [babel-preset-env](https://github.com/babel/babel-preset-env).
- Linting with [ESLint](http://eslint.org/).

## Features

The API has the following features:
- Return all United States conties.
- Filter United States conties by county name and state.
- Return the available indicators from each county.
- Return the available indicators that can be queried.

In addition to that, you can update, add, or delete information that is returned by the API by updating, adding or deleting files from `public/files`. This changes will dinamlically change the routes available. The files in the mentioned directory must follow some rules:
- Must be a CSV comma separated file
- Must follow the structure:

| | | | | | | | | | |
|-|-|-|-|-|-|-|-|-|-|
| Title      |            |           | year1   |     |         | year2   |     |        | ... |
| State      | FIPS Codes | County    | label 1 | ... | label n | label 1 | ... | label n| ... |
| StateA     | XXXX       | CountyX   | data 1  | ... | data 2  | data 3  | ... | data  m| ... |
| StateB     | YYYY       | CountyY   | data 1  | ... | data 2  | data 3  | ... | data  m| ... |
| ...        | ...        | ...       | data 1  | ... | data 2  | data 3  | ... | data  m| ... |

- Example:

| | | | | | | | | | |
|-|-|-|-|-|-|-|-|-|-|
| Diabetes   |            |           | 2004                |     |                | 2005               |     |               | ... |
| State      | FIPS Codes | County    | number of new cases | ... | rate per 1000 | number of new cases | ... | rate per 1000 | ... |
| Alabama    | 1001       | Autaga    | 425                 | ... | 14.2          | 471                 | ... | 15.6          | ... |
| Alabama    | 1003       | Baldwin   | 1103                | ... | 10.3          | 1080                | ... | 9.7           | ... |

## Getting started


```sh
# Clone the project
git clone GIT_REPO health-data-api
cd health-data-api

# Install dependencies
yarn

# Run development
yarn run dev
```

### Deployment

To generate the production build:

```sh
yarn run build
```

To start the production API: 

```sh
yarn start
```

## API Reference

### Get counties

- Route: `GET /counties`
- Query parameters:
  - county
  - state
- Example request 
```
GET /counties?state=alabama&county=Bald`
```
- Example body response:
```json
[
  {
    "state": "Alabama",
    "county": "Baldor County",
    "fips": "01101"
  },
  {
    "state": "Alabama",
    "county": "Baldwin County",
    "fips": "01003"
  }
]
```

### Get available indicators/data

- Route: `GET /available-data`
- Example body response:
```json
[
  {
    "key": 0,
    "path": "diabetes-incidence",
    "name": "Diabetes incidence"
  },
  {
    "key": 1,
    "path": "diabetes-prevalence",
    "name": "Diabetes prevalence"
  },
  {
    "key": 2,
    "path": "obesity-prevalence",
    "name": "Obesity prevalence"
  },
  {
    "key": 3,
    "path": "physical-inactivity",
    "name": "Physical inactivity"
  }
]
```

### Get data
- Route `GET /data-path-here`
- Query parameters:
  - county
  - state
  - page
  - perPage
- Example request 1 
```
GET /diabetes-incidence?state=alabama&county=Bald`
```
- Example request 2

```
GET /diabetes-incidence?page=1$perPage=20
```
- Example body response:
```json
{
  "years": [
    "2009",
    "2010",
    "2011",
    "2012",
    "2013"
  ],
  "labels": [
    "number (men)",
    "percent (men)",
    "lower confidence limit (men)",
    "upper confidence limit (men)",
    "age-adjusted percent (men)",
    "age-adjusted lower confidence limit (men)",
    "age-adjusted upper confidence limit (men)",
    "number (women)",
    "percent (women)",
    "lower confidence limit (women)",
    "upper confidence limit (women)",
    "age-adjusted percent (women)",
    "age-adjusted lower confidence limit (women)",
    "age-adjusted upper confidence limit (women)"
  ],
  "data": [
    {
      "2009": [ "2149", "12.8", "10", "16", "12.4", "9.8", "15.6", "2189", "11.9", "9.1", "15.2", "11.1", "8.5", "14.2"],
      "2010": [ "2224", "12.1", "9.5", "15.2", "11.6", "9.2", "14.6", "2336", "11.6", "8.9", "14.7", "10.9", "8.3", "13.8"],
      "2011": [ "2345", "12.4", "9.8", "15.5", "11.9", "9.4", "14.9", "2403", "11.7", "8.9", "15.2", "10.9", "8.2", "14.2"],
      "2012": [ "2350", "12.5", "9.8", "15.6", "11.7", "9.2", "14.7", "2373", "11.5", "8.8", "14.6", "10.6", "8", "13.4"],
      "2013": [ "2577", "13.6", "10.8", "16.6", "12.8", "10.2", "15.5", "2567", "12.4", "9.7", "15.4", "11.3", "8.7", "14.2"],
      "county": "Autauga County",
      "state": "Alabama",
      "fips": "01001"
    },
    {
      "2009": [ "2149", "12.8", "10", "16", "12.4", "9.8", "15.6", "2189", "11.9", "9.1", "15.2", "11.1", "8.5", "14.2"],
      "2010": [ "2224", "12.1", "9.5", "15.2", "11.6", "9.2", "14.6", "2336", "11.6", "8.9", "14.7", "10.9", "8.3", "13.8"],
      "2011": [ "2345", "12.4", "9.8", "15.5", "11.9", "9.4", "14.9", "2403", "11.7", "8.9", "15.2", "10.9", "8.2", "14.2"],
      "2012": [ "2350", "12.5", "9.8", "15.6", "11.7", "9.2", "14.7", "2373", "11.5", "8.8", "14.6", "10.6", "8", "13.4"],
      "2013": [ "2577", "13.6", "10.8", "16.6", "12.8", "10.2", "15.5", "2567", "12.4", "9.7", "15.4", "11.3", "8.7", "14.2"],
      "county": "Baldor County",
      "state": "Alabama",
      "fips": "01101"
    }
  ]
}
```

## Tests

Start the test runner in watch mode with:

```sh
yarn test
```

