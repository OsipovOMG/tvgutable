const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Подключение к базе данных
const db = new sqlite3.Database('data\\schedule.db');

// Разрешаем CORS
app.use(cors());

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Получение списка групп
app.get('/api/groups', (req, res) => {
    db.all('SELECT DISTINCT group_name FROM timetable ORDER BY group_name', [], (err, rows) => {
        if (err) {
            console.error('Ошибка при получении списка групп:', err);
            res.status(500).json({ error: 'Ошибка при получении списка групп' });
            return;
        }
        res.json(rows);
    });
});

// Получение списка дней недели
app.get('/api/days', (req, res) => {
    db.all('SELECT id, name FROM days ORDER BY id', [], (err, rows) => {
        if (err) {
            console.error('Ошибка при получении дней недели:', err);
            res.status(500).json({ error: 'Ошибка при получении дней недели' });
            return;
        }
        res.json(rows);
    });
});

// Получение расписания для группы
app.get('/api/schedule', (req, res) => {
    const groupName = req.query.group_name;
    db.all(`
        SELECT s.*, d.name as day_name
        FROM timetable s
        JOIN days d ON s.day_id = d.id
        WHERE s.group_name = ?
        ORDER BY s.day_id, s.start_time
    `, [groupName], (err, rows) => {
        if (err) {
            console.error('Ошибка при получении расписания:', err);
            res.status(500).json({ error: 'Ошибка при получении расписания' });
            return;
        }
        res.json(rows);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
