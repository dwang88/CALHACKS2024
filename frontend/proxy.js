const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/pdf', async (req, res) => {
    const pdfUrl = req.query.url;
    try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error('Error fetching PDF');
        }
        response.body.pipe(res);
    } catch (err) {
        res.status(500).send('Error fetching PDF');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
