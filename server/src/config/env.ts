import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    duneApiKey: process.env.DUNE_API_KEY || '',
    queryId: process.env.DUNE_QUERY_ID || '',
};