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


let apiKeys = {}; // Tempat untuk menyimpan API Keys dan limit mereka

// Fungsi untuk reset limit setiap jam
setInterval(() => {
    for (const key in apiKeys) {
        apiKeys[key].limit = apiKeys[key].isPremium ? 1000 : 100; // Reset limit
    }
}, 60 * 60 * 1000); // Reset setiap jam

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

// Route untuk menambah API Key
app.post('/addapikey', (req, res) => {
    const { key } = req.body;
    if (!key) {
        return res.status(400).send('API Key diperlukan!');
    }
    apiKeys[key] = { isPremium: false, limit: 100 }; // Default free limit
    res.send(`API Key ${key} berhasil ditambahkan dengan status free!`);
});

// Route untuk menghapus API Key
app.delete('/removekey', (req, res) => {
    const { key } = req.body;
    if (apiKeys[key]) {
        delete apiKeys[key];
        return res.send(`API Key ${key} berhasil dihapus!`);
    }
    res.status(404).send('API Key tidak ditemukan!');
});

// Route untuk mengecek API Key
app.get('/checkapikey', (req, res) => {
    const { key } = req.query;
    if (apiKeys[key]) {
        return res.send(apiKeys[key]);
    }
    res.status(404).send('API Key tidak ditemukan!');
});

// Route untuk menambahkan API Key premium
app.post('/addpremiumapikey', (req, res) => {
    const { key } = req.body;
    if (apiKeys[key]) {
        apiKeys[key].isPremium = true;
        apiKeys[key].limit = 1000; // Set limit premium
        return res.send(`API Key ${key} berhasil diupgrade menjadi premium!`);
    }
    res.status(404).send('API Key tidak ditemukan!');
});

// Route untuk mendapatkan limit dari API Key
app.get('/checklimit', (req, res) => {
    const { key } = req.query;
    if (apiKeys[key]) {
        return res.send(`Limit untuk API Key ${key}: ${apiKeys[key].limit}`);
    }
    res.status(404).send('API Key tidak ditemukan!');
});

// Route untuk mereset limit API Key
app.post('/resetlimit', (req, res) => {
    const { key } = req.body;
    if (apiKeys[key]) {
        apiKeys[key].limit = apiKeys[key].isPremium ? 1000 : 100; // Reset limit sesuai jenis
        return res.send(`Limit untuk API Key ${key} berhasil direset!`);
    }
    res.status(404).send('API Key tidak ditemukan!');
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
    const apikeyInput = req.query.apikey,
		message = req.query.message
	
	if(!apikeyInput) return res.json({ error: 'Parameter "Apikey" tidak ditemukan' });
	if(apikeyInput !== `${key}`) return res.json({ error: 'Apikey Invalid' });
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
