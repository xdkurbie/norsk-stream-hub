const axios = require('axios');

const CINEMETA_URL = 'https://v3-cinemeta.strem.io/meta';
const JW_API_URL = 'https://apis.justwatch.com/graphql';

const SUPPORTED_PROVIDERS = {
    "NRK TV": "NRK TV",
    "TV 2 Play": "TV 2 Play",
    "Max": "Max",
    "Strim": "Strim",
    "Viaplay": "Viaplay",
    "Disney Plus": "Disney+",
    "Amazon Prime Video": "Prime Video",
    "SkyShowtime": "SkyShowtime",
    "Apple TV": "Apple TV (Kjøp/Lei)",
    "Google Play Movies": "Google Play (Kjøp/Lei)",
    "SF Anytime": "SF Anytime (Lei)",
    "Rakuten TV": "Rakuten TV (Kjøp/Lei)",
    "Blockbuster": "Blockbuster (Lei)",
};

const JW_QUERY = `
query GetSearchTitles(
  $searchTitlesFilter: TitleFilter!,
  $country: Country!,
  $language: Language!,
  $first: Int!,
  $filter: OfferFilter!
) {
  popularTitles(
    country: $country
    filter: $searchTitlesFilter
    first: $first
    sortBy: POPULAR
  ) {
    edges {
      node {
        id
        content(country: $country, language: $language) {
          title
          externalIds {
            imdbId
          }
        }
        objectType
        ... on Movie {
          offers(country: $country, platform: WEB, filter: $filter) {
            monetizationType
            standardWebURL
            package { clearName }
          }
        }
        ... on Show {
          offers(country: $country, platform: WEB, filter: $filter) {
            monetizationType
            standardWebURL
            package { clearName }
          }
        }
      }
    }
  }
}
`;

async function getMeta(type, id) {
    try {
        const res = await axios.get(`${CINEMETA_URL}/${type}/${id}.json`);
        return res.data.meta;
    } catch (e) {
        return null;
    }
}

async function searchJustWatch(query) {
    try {
        const res = await axios.post(JW_API_URL, {
            operationName: 'GetSearchTitles',
            query: JW_QUERY,
            variables: {
                first: 10,
                searchTitlesFilter: {
                    searchQuery: query
                },
                country: "NO",
                language: "no",
                filter: {
                    bestOnly: true
                }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://www.justwatch.com',
                'Referer': 'https://www.justwatch.com/no/search?q=' + encodeURIComponent(query),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'x-jw-platform': 'web'
            }
        });
        return res.data.data.popularTitles.edges;
    } catch (e) {
        console.error("JustWatch Search Error:", e.response ? JSON.stringify(e.response.data) : e.message);
        return [];
    }
}

async function getStreams(type, id, extra = {}) {
    // 1. Get Meta
    const meta = await getMeta(type, id);
    if (!meta) return [];

    const searchTitle = meta.name;

    // 2. Search JustWatch
    const results = await searchJustWatch(searchTitle);
    if (results.length === 0) return [];

    // 3. Find Best Match
    let bestMatch = results.find(edge => edge.node.content?.externalIds?.imdbId === id);
    if (!bestMatch) {
        // Fallback to title matching or first result if not found by IMDb
        bestMatch = results[0];
    }

    const node = bestMatch.node;
    const streams = [];

    // 4. Extract Offers
    if (node.offers && node.offers.length > 0) {
        node.offers.forEach(offer => {
            const providerName = offer.package.clearName;
            if (SUPPORTED_PROVIDERS[providerName]) {
                const label = SUPPORTED_PROVIDERS[providerName];
                
                let monetization = 'Se';
                switch(offer.monetizationType) {
                    case 'FLATRATE': monetization = 'Abonnement'; break;
                    case 'FREE': monetization = 'Gratis'; break;
                    case 'RENT': monetization = 'Lei'; break;
                    case 'BUY': monetization = 'Kjøp'; break;
                }

                streams.push({
                    name: `NORGE-HUB`,
                    title: `${label} (${monetization})`,
                    externalUrl: offer.standardWebURL
                });
            }
        });
    }

    // Filter unique streams by externalUrl
    const uniqueStreams = [];
    const seenUrls = new Set();
    for (const s of streams) {
        if (!seenUrls.has(s.externalUrl)) {
            uniqueStreams.push(s);
            seenUrls.add(s.externalUrl);
        }
    }

    return uniqueStreams;
}

module.exports = { getStreams };
