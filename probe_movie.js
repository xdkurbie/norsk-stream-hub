const axios = require('axios');

const query = `
query IntrospectMovie {
  __type(name: "Movie") {
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
`;

async function probe() {
  try {
    const res = await axios.post('https://apis.justwatch.com/graphql', { query: query }, {
      headers: { 
        'Content-Type': 'application/json',
        'x-jw-platform': 'web'
      }
    });
    console.log(JSON.stringify(res.data.data.__type.fields, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

probe();
