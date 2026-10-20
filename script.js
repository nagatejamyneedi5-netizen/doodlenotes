// ==========================================
// 1. AUTOMATIC INITIALIZATION & LOCAL STORAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadCanvas();
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('doodleNotes_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// ==========================================
// 2. TO-DO LIST LOGIC
// ==========================================
function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text === '') return;

    createTaskElement(text);
    saveTasks();
    input.value = '';
}

function createTaskElement(text) {
    const li = document.createElement('li');
    li.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.onclick = function() {
        li.remove();
        saveTasks();
    };

    li.appendChild(deleteBtn);
    document.getElementById('taskList').appendChild(li);
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        tasks.push(li.firstChild.textContent);
    });
    localStorage.setItem('doodleNotes_tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('doodleNotes_tasks');
    if (saved) {
        JSON.parse(saved).forEach(taskText => createTaskElement(taskText));
    }
}

// ==========================================
// 3. CALCULATOR LOGIC & KEYBOARD SUPPORT
// ==========================================
const display = document.getElementById('calcDisplay');

function appendCalc(val) {
    display.value += val;
}

function clearCalc() {
    display.value = '';
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch {
        display.value = 'Error';
    }
}

// Enable keyboard input for calculator
document.addEventListener('keydown', (e) => {
    if (document.activeElement.id === 'taskInput') return;

    const key = e.key;
    
    if (!isNaN(key) || key === '.') {
        appendCalc(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendCalc(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearCalc();
    }
});

// ==========================================
// 4. POMODORO STUDY TIMER LOGIC
// ==========================================
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes
let timerRunning = false;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerRunning = false;
            alert('Study session complete! Take a break.');
            timeLeft = 25 * 60;
            updateTimerDisplay();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
}

// ==========================================
// 5. DARK MODE TOGGLE
// ==========================================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('doodleNotes_theme', 'dark');
    } else {
        localStorage.setItem('doodleNotes_theme', 'light');
    }
}

// ==========================================
// 6. ADVANCED DOODLE CANVAS LOGIC
// ==========================================
const canvas = document.getElementById('doodleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    loadCanvas();
}

let painting = false;
let currentTool = 'pen'; // 'pen', 'marker', 'eraser'
let currentColor = '#000000';
let currentSize = 3;

const brushSizeInput = document.getElementById('brushSize');
brushSizeInput.addEventListener('input', (e) => currentSize = e.target.value);

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.toolbar .btn').forEach(btn => btn.classList.remove('active-tool'));

    if (tool === 'pen') {
        document.getElementById('penBtn').classList.add('active-tool');
    } else if (tool === 'marker') {
        document.getElementById('markerBtn').classList.add('active-tool');
    } else if (tool === 'eraser') {
        document.getElementById('eraserBtn').classList.add('active-tool');
    }
}

function changeColor(color) {
    currentColor = color;
    document.getElementById('colorPicker').value = color;
    if (currentTool === 'eraser') setTool('pen');
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
    saveCanvas();
}

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'pen') {
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 1.0;
    } else if (currentTool === 'marker') {
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 0.3; // Highlighter transparency
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff';
        ctx.globalAlpha = 1.0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvas();
}

function saveCanvas() {
    localStorage.setItem('doodleNotes_canvas', canvas.toDataURL());
}

function loadCanvas() {
    const savedImage = localStorage.getItem('doodleNotes_canvas');
    if (savedImage) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = savedImage;
    }
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'my-doodle.png';
    link.href = canvas.toDataURL();
    link.click();
}

window.addEventListener('resize', resizeCanvas);