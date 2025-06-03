import express from "express";
import cors from "cors";
import { DB } from "./db.js";
import routes from "./api_routes.js";

const PORT = process.env.PORT;

/* #############################################################################
                                START SERVER
##############################################################################*/

// init app
const app = express();

// middleware for ALL endpoints
app.use(
    cors({
        origin:'*',
        credentials: true,
        optionsSuccessStatus:200
    })
).use(
    // Parses ALL incoming requests with JSON payloads
    express.json({ type: "application/json" })
)

// db connection
const isConnected = await DB.connect();
if (isConnected) {
    console.log("Connected to MongoDB");
} else {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
}

// Handle server errors
app.on('error', (app) => {
    if (app['code'] === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        throw app;
    }
});

app.use(routes)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});