const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const manifest = require("./manifest");
const { getStreams } = require("./providers");

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    console.log(`[${new Date().toISOString()}] Request for streams: ${type} ${id}`);
    
    try {
        // Parse ID (e.g., tt1234567:1:1 for series)
        const idParts = id.split(':');
        const imdbId = idParts[0];
        const season = idParts[1];
        const episode = idParts[2];

        const streams = await getStreams(type, imdbId, { season, episode });
        
        console.log(`  Found ${streams.length} streams for ${imdbId}`);
        return { streams };
    } catch (e) {
        console.error(`  Error handling stream request:`, e.message);
        return { streams: [] };
    }
});

const addonInterface = builder.getInterface();
serveHTTP(addonInterface, { port: process.env.PORT || 7000 });

console.log(`NORGE-HUB version ${manifest.version} started`);
console.log(`URL: http://localhost:7000/manifest.json`);
