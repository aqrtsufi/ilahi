import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/read-song', async (req, res) => {
  const url = 'https://raw.githubusercontent.com/yashineonline/ilahiRepository/main/ilahi.txt';
  const response = await fetch(url);
  const data = await response.text();
  res.send(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
