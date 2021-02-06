# GBBO API

[Great British Bake Off](https://en.wikipedia.org/wiki/The_Great_British_Bake_Off) series data sourced from Wikipedia via web scraping and exposed as a GraphQL API for querying the data. Built mainly for experimentation purposes, but feel free to use the data as you wish!

## Tech Stack

- Node.js
- Express
- GraphQL
- JSDOM for scraping the data

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v12 or later recommended)

### Installation

1. Clone the repository
2. Run `npm install` to install the required dependencies
3. Run the server using `npm start`

You can now POST requests to `http://localhost:4000/graphql`. Visit this address in the browser to make use of the GraphiQL interface for exploring documentation and building out queries.

### Missing or outdated data?

Several npm scripts are provided for refetching data from Wikipedia. This will overwrite the existing files in the `data` directory.

Use `npm run scrape` to run **ALL** scrapers.

Alternatively, you can fetch only the data you require using the following scripts:

#### Fetch bakers

`npm run scrape:bakers`

#### Fetch challenges

`npm run scrape:challenges`

#### Fetch episodes

`npm run scrape:episodes`

#### Fetch ratings

`npm run scrape:ratings`

#### Fetch series

`npm run scrape:series`
