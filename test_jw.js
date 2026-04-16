const axios = require('axios');

async function testJustWatch() {
    const query = `
    query GetSearchTitles($country: String!, $language: String!, $first: Int!, $query: String!) {
      popularTitles(country: $country, first: $first, filter: { searchQuery: $query }) {
        edges {
          node {
            title
            id
            offers(country: $country) {
              monetizationType
              package { clearName shortName }
              standardWeb { url }
            }
          }
        }
      }
    }
    `;

    try {
        const response = await axios.post('https://graphql.justwatch.com', {
            operationName: 'GetSearchTitles',
            variables: {
                country: 'NO',
                language: 'no',
                first: 5,
                query: 'mord i sogn'
            },
            query: query
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const results = response.data.data.popularTitles.edges;
        results.forEach(edge => {
            console.log(`Title: ${edge.node.title}`);
            edge.node.offers.forEach(offer => {
                console.log(`  Provider: ${offer.package.clearName} - URL: ${offer.standardWeb.url}`);
            });
        });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testJustWatch();
