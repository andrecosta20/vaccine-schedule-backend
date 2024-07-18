const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;
const dataFilePath = './schedules.json';

app.use(cors());
app.use(bodyParser.json());

let schedules = [];

const loadSchedules = () => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
};

const saveSchedules = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify(schedules, null, 2));
};

schedules = loadSchedules();

app.use((req, res, next) => {
  res.on('finish', saveSchedules);
  next();
});

app.get('/', (req, res) => {
  res.send('Servidor está funcionando!');
});

app.post('/schedule', (req, res) => {
  const { name, birthDate, date, time } = req.body;

  console.log('Recebido:', { name, birthDate, date, time });

  if (!name || !birthDate || !date || !time) {
    console.log('Erro: Todos os campos são obrigatórios.');
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  const daySchedules = schedules.filter(schedule => schedule.date === date);
  console.log('Agendamentos do dia:', daySchedules.length);

  if (daySchedules.length >= 20) {
    console.log('Erro: Não há vagas disponíveis para este dia.');
    return res.status(400).send('Não há vagas disponíveis para este dia.');
  }

  const timeSchedules = daySchedules.filter(schedule => schedule.time === time);
  console.log('Agendamentos do horário:', timeSchedules.length);

  if (timeSchedules.length >= 2) {
    console.log('Erro: Não há vagas disponíveis para este horário.');
    return res.status(400).send('Não há vagas disponíveis para este horário.');
  }

  const scheduleTime = new Date(`${date}T${time}`);
  const isConflict = daySchedules.some(schedule => {
    const existingTime = new Date(`${schedule.date}T${schedule.time}`);
    const diff = Math.abs(scheduleTime - existingTime);

    if (time === schedule.time && timeSchedules.length < 2) {
      return false;
    }

    return diff < 60 * 60 * 1000;
  });

  if (isConflict) {
    console.log('Erro: Intervalo entre agendamentos deve ser de pelo menos 1 hora.');
    return res.status(400).send('Intervalo entre agendamentos deve ser de pelo menos 1 hora.');
  }

  const newSchedule = { name, birthDate, date, time, status: 'Não realizado' };
  schedules.push(newSchedule);

  console.log('Agendamento criado com sucesso:', newSchedule);
  res.status(201).send('Agendamento criado com sucesso!');
});

app.get('/schedules', (req, res) => {
  res.json(schedules);
});

app.put('/schedule/:index', (req, res) => {
  const { index } = req.params;
  const { status } = req.body;

  if (schedules[index]) {
    schedules[index].status = status;
    return res.status(200).send('Status do agendamento atualizado com sucesso.');
  } else {
    return res.status(404).send('Agendamento não encontrado.');
  }
});

app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}, pronto para receber agendamentos!`);
});
