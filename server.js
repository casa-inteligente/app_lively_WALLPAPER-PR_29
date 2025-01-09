const express = require('express');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/data', (req, res) => {
    const workbook = xlsx.readFile('C:/Users/AULA-1/Documents/GitHub/app_lively_WALLPAPER-PR_29/Pauta de Audiências.xlsx');
    const sheet_name = '2025';
    const worksheet = workbook.Sheets[sheet_name];
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    range.s.r = 4; // A linha do cabeçalho (linha 5 no Excel, índice 4 no código)
    const newRange = xlsx.utils.encode_range(range);
    worksheet['!ref'] = newRange;

    const xlData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = xlData[0];
    const data = xlData.slice(1).map(row => ({
        DATA: row[1],
        HORA: row[2],
        NOME: row[3],
        SITUACAO: row[4]
    }));

    res.json(data);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
