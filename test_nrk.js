const axios = require('axios');

async function testNRK() {
    try {
        const response = await axios.get('https://tv.nrk.no/sok?q=mord+i+sogn');
        const html = response.data;
        
        // Try to find series link
        const regex = /\/serie\/([a-zA-Z0-9-]+)/g;
        let matches = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            matches.push(match[1]);
        }
        
        console.log('Results:', [...new Set(matches)]);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testNRK();
