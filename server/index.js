const express = require('express');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const groqRoutes = require('./routes/groq');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        res.status(504).send('Server Timeout');
    });
    next();
});

app.use('/api', groqRoutes);

app.get('/', (req, res) => {
    res.send('Server backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});