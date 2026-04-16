const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const manifest = require("./manifest");
const { getStreams } = require("./providers");

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    console.log(`[${new Date().toISOString()}] Request for streams: ${type} ${id}`);
    
    try {
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
const router = getRouter(addonInterface);

const app = express();
app.use(router);

// For local development
if (require.main === module) {
    const port = process.env.PORT || 7000;
    app.listen(port, () => {
        console.log(`NORGE-HUB started locally on port ${port}`);
        console.log(`Manifest URL: http://localhost:${port}/manifest.json`);
    });
}

// Export for Vercel
module.exports = app;
