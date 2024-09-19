document.addEventListener('DOMContentLoaded', () => {
    const groupSelect = document.getElementById('group-select');
    const showScheduleBtn = document.getElementById('show-schedule-btn');
    const scheduleDiv = document.getElementById('schedule');
    const dayNames = {};

    // Фиксированная дата начала учебного года (например, 1 сентября 2024)
    const semesterStart = new Date('2024-09-07');

    // Функция для определения типа недели
    function getWeekType() {
        const currentDate = new Date();
        const timeDiff = currentDate - semesterStart; // разница в миллисекундах
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // перевод в дни
        const weeksPassed = Math.floor(daysDiff / 7); // перевод в недели
        return weeksPassed % 2 === 0 ? '+' : '-'; // чётные недели - "+", нечётные - "-"
    }

    // Функция для загрузки групп
    async function loadGroups() {
        try {
            const response = await fetch('http://localhost:3000/api/groups');
            if (!response.ok) {
                throw new Error(`HTTP ошибка! статус: ${response.status}`);
            }
            const groups = await response.json();
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.group_name;
                option.textContent = group.group_name;
                groupSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка при загрузке групп:', error);
        }
    }

    // Функция для загрузки дней недели
    async function loadDays() {
        try {
            const response = await fetch('http://localhost:3000/api/days');
            if (!response.ok) {
                throw new Error(`HTTP ошибка! статус: ${response.status}`);
            }
            const days = await response.json();
            days.forEach(day => {
                dayNames[day.id] = day.name;
            });
        } catch (error) {
            console.error('Ошибка при загрузке дней недели:', error);
        }
    }

    // Функция для загрузки расписания
    async function loadSchedule() {
        const groupName = groupSelect.value;
        const weekType = getWeekType(); // Определяем тип недели автоматически
        try {
            const response = await fetch(`http://localhost:3000/api/schedule?group_name=${groupName}&week_type=${weekType}`);
            if (!response.ok) {
                throw new Error(`HTTP ошибка! статус: ${response.status}`);
            }
            const schedule = await response.json();
            if (schedule.length === 0) {
                scheduleDiv.innerHTML = `Сейчас неделя ${weekType} не найдено.`;
                return;
            }
            displaySchedule(schedule, weekType); // Передаем тип недели для отображения в заголовке
        } catch (error) {
            console.error('Ошибка при загрузке расписания:', error);
            scheduleDiv.innerHTML = 'Ошибка при загрузке расписания.';
        }
    }

    // Функция для отображения расписания
    function displaySchedule(schedule, weekType) {
        const scheduleHTML = {};
        schedule.forEach(item => {
            const dayName = item.day_name;
            if (!scheduleHTML[dayName]) {
                scheduleHTML[dayName] = [];
            }
            scheduleHTML[dayName].push(`
                <div class="schedule-item">
                    <div class="time">
                        <p>${item.start_time} ${item.end_time}</p>
                    </div>
                    <div class="info">
                        <h3 class="subject">${item.subject}</h3>
                        <p class="details">Преподаватель: ${item.teacher}</p>
                        <p class="details">${item.class_type}, Аудитория: ${item.room}</p>
                        ${item.korpus && item.korpus.toUpperCase() !== 'NULL' ? `<p class="details">Корпус: ${item.korpus}</p>` : ''}
                    </div>
                </div>
            `);
        });
    
        const weekColor = weekType === '+' ? 'blue' : 'red';
        scheduleDiv.innerHTML = `<h1 class="weektype" style="color: ${weekColor};">Сейчас неделя ${weekType}</h1>` + Object.keys(scheduleHTML).map(dayName => `
            <div class="day">
                <h2>${dayName}</h2>
                ${scheduleHTML[dayName].join('')}
            </div>
        `).join('');
    }
    

    loadGroups();
    loadDays();

    showScheduleBtn.addEventListener('click', loadSchedule);
});
