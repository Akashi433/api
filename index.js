const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());
app.use(bodyParser.json());


let apiKeys = {};
const FREE_LIMIT = 100;
const PREMIUM_LIMIT = 1000;
const RESET_TIME = 3600000; // 1 jam dalam milidetik

// Middleware untuk memeriksa API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['apikey'];
    if (apiKeys[apiKey]) {
        next();
    } else {
        res.status(403).send('API key tidak valid');
    }
};

// Fungsi untuk ragBot
async function ragBot(message) {
  try {
    const response = await axios.post('https://ragbot-starter.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }],
      useRag: true,
      llm: 'gpt-3.5-turbo',
      similarityMetric: 'cosine'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk pinecone
async function pinecone(message) {
  try {
    const response = await axios.post('https://pinecone-vercel-example.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function blackboxAIChat(message) {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ id: null, content: message, role: 'user' }],
      id: null,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fitur untuk menambahkan API key
app.post('/addapikey', (req, res) => {
    const { apikey } = req.body;
    if (apikey) {
        apiKeys[apikey] = { limit: FREE_LIMIT, lastReset: Date.now() };
        res.send(`API key ${apikey} berhasil ditambahkan!`);
    } else {
        res.status(400).send('API key tidak boleh kosong');
    }
});

// Fitur untuk menghapus API key
app.post('/removekey', (req, res) => {
    const { apikey } = req.body;
    if (apiKeys[apikey]) {
        delete apiKeys[apikey];
        res.send(`API key ${apikey} berhasil dihapus!`);
    } else {
        res.status(404).send('API key tidak ditemukan');
    }
});

// Fitur untuk memeriksa API key
app.post('/checkapikey', (req, res) => {
    const { apikey } = req.body;
    if (apiKeys[apikey]) {
        res.send(`API key ${apikey} valid! Sisa limit: ${apiKeys[apikey].limit}`);
    } else {
        res.status(403).send('API key tidak valid');
    }
});

// Fitur untuk premium API key
app.post('/premiumapikey', (req, res) => {
    const { apikey } = req.body;
    if (apiKeys[apikey]) {
        const currentTime = Date.now();
        if (currentTime - apiKeys[apikey].lastReset > RESET_TIME) {
            apiKeys[apikey].limit = PREMIUM_LIMIT; // Reset limit
            apiKeys[apikey].lastReset = currentTime;
        }
        if (apiKeys[apikey].limit > 0) {
            apiKeys[apikey].limit -= 1; // Kurangi limit
            res.send(`Penggunaan API key ${apikey} berhasil! Sisa limit: ${apiKeys[apikey].limit}`);
        } else {
            res.status(429).send('Limit API key sudah habis, coba lagi nanti.');
        }
    } else {
        res.status(403).send('API key tidak valid');
    }
});

// Endpoint untuk ragBot
app.get('/api/ragbot', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await ragBot(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/pinecone', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinecone(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk blackboxAIChat
app.get('/api/blackboxAIChat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await blackboxAIChat(message);
    res.status(200).json({
      status: 200,
      creator: "siputzx",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
