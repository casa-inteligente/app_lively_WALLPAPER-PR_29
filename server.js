const express = require('express');
const xlsx = require('xlsx');
const { format, isAfter, startOfDay } = require('date-fns');

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
    console.log('Dados do Excel:', xlData); // Adicionando log para debug
    const today = startOfDay(new Date());

    const data = xlData.slice(1).map(row => {
        const dateValue = (row[0] - (25567 + 1)) * 86400 * 1000; // Ajustando para o bug do Excel
        const date = new Date(dateValue);

        let hours, minutes, seconds;

        if (typeof row[1] === 'number') {
            // Caso o valor seja um número, converte para horas, minutos e segundos
            const totalSeconds = Math.floor((row[1] - (25567 + 1)) * 86400);
            hours = Math.floor(totalSeconds / 3600);
            minutes = Math.floor((totalSeconds % 3600) / 60);
            seconds = totalSeconds % 60;
        } else if (typeof row[1] === 'string') {
            // Caso o valor seja uma string, divida e converte para horas, minutos e segundos
            const timeParts = row[1].split(':');
            hours = parseInt(timeParts[0], 10);
            minutes = parseInt(timeParts[1], 10);
            seconds = parseInt(timeParts[2], 10);
        }

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);

        return {
            DATA: format(date, 'dd/MM'),
            HORA: format(date, 'HH:mm:ss'),
            NOME: row[2],
            SITUACAO: row[3],
            fullDate: startOfDay(date) // Preserve a data para comparação
        };
    });

    console.log('Dados processados:', data); // Adicionando log para debug

    const filteredData = data.filter(row => isAfter(row.fullDate, today) || row.fullDate.getTime() === today.getTime())
        .map(({ fullDate, ...rest }) => rest);

    console.log('Dados filtrados:', filteredData); // Adicionando log para debug

    res.json(filteredData);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
