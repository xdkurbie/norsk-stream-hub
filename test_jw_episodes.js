const axios = require('axios');

const query = `
query GetTitleDetails($id: ID!, $country: Country!) {
  node(id: $id) {
    ... on Show {
      seasons {
        edges {
          node {
            seasonNumber
            episodes {
              edges {
                node {
                  episodeNumber
                  offers(country: $country, platform: WEB) {
                    standardWebURL
                    package {
                      clearName
                      shortName
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    ... on Movie {
      offers(country: $country, platform: WEB) {
        standardWebURL
        package {
          clearName
          shortName
        }
      }
    }
  }
}
`;

async function test() {
  try {
    const res = await axios.post('https://apis.justwatch.com/graphql', {
      query: query,
      variables: {
        id: 'ts469884', // Mord i Sogn (Sogn Murders)
        country: 'NO'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.justwatch.com'
      }
    });

    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

test();
