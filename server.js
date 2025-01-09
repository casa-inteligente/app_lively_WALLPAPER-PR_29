const express = require('express');
const xlsx = require('xlsx');
const { format } = require('date-fns');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/data', (req, res) => {
    const workbook = xlsx.readFile('C:/Users/AULA-1/Documents/GitHub/app_lively_WALLPAPER-PR_29/Pauta de Audiências.xlsx');
    const sheet_name = '2025';
    const worksheet = workbook.Sheets[sheet_name];
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    range.s.r = 5; // Ignora a primeira linha de dados (linha 6 no Excel, índice 5 no código)
    const newRange = xlsx.utils.encode_range(range);
    worksheet['!ref'] = newRange;

    const xlData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = xlData[0];
    const data = xlData.slice(1).map(row => {
        const date = new Date((row[0] - (25567 + 2)) * 86400 * 1000);
        const time = new Date((row[1] - (25567 + 2)) * 86400 * 1000);
        return {
            DATA: format(date, 'dd/MM'),
            HORA: format(time, 'HH:mm'),
            NOME: row[2],
            SITUACAO: row[3]
        };
    });

    res.json(data);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


