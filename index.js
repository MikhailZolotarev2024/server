const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/wallet/:address', async (req, res) => {
  const address = req.params.address.toLowerCase();
  const ethBalanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=KFDXUKTPT41ARKIHSZ6I8S2FFJ3DRN25YA`; // вставь свой API ключ

  try {
    const [ethBalanceRes, tokensRes, defiRes] = await Promise.all([
      fetch(ethBalanceUrl).then(r => r.json()),
      fetch(`https://openapi.debank.com/v1/user/token_list?id=${address}&chain_id=eth`, {
        headers: {
          "accept": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://debank.com/"
        }
      }).then(r => r.json()),
      fetch(`https://openapi.debank.com/v1/user/complex_protocol_list?id=${address}`, {
        headers: {
          "accept": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://debank.com/"
        }
      }).then(r => r.json())
    ]);

    res.json({
      eth_balance: (parseFloat(ethBalanceRes.result) / 1e18).toFixed(4),
      tokens: tokensRes.slice(0, 5), // топ 5 токенов
      defi: defiRes.filter(p => p.portfolio_item_list?.length > 0)
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});