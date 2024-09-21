const readline = require('readline');
const fs = require('fs');
const path = require('path');

const TASKS_FILE = 'tasks.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function start() {
    return new Promise((resolve) => {
        rl.question('task-cli ', async (input) => {
            await operate(input);
            rl.close();
            resolve();
        });
    });
}

async function operate(input) {
    const [operation, taskId] = input.split(' ');
    const taskDescription = getTaskDescription(input);

    switch (operation) {
        case 'add':
            addTask(taskDescription);
            break;
        case 'update':
            updateTask(taskId, taskDescription);
            break;
        case 'delete':
            deleteTask(taskId);
            break;
        case 'mark-in-progress':
            changeStatus(taskId, 'in-progress');
            break;
        case 'mark-done':
            changeStatus(taskId, 'done');
            break;
        case 'list':
            const status = taskId || null;
            listTasks(status);
            break;
        default:
            console.error('Unknown command. Please use add, update, delete, mark-in-progress, mark-done, or list.');
    }
}

function readTasks() {
    if (fs.existsSync(TASKS_FILE)) {
        const fileData = fs.readFileSync(TASKS_FILE, 'utf-8');
        return fileData ? JSON.parse(fileData) : [];
    }
    return [];
}

function writeTasks(tasks) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

function addTask(taskDescription) {
    const tasks = readTasks();

    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
        description: taskDescription,
        status: 'in-progress',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    tasks.push(newTask);
    writeTasks(tasks);

    console.log(`Task added successfully (ID: ${newTask.id})`);
}

function updateTask(taskId, newDescription) {
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id == taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].description = newDescription;
        tasks[taskIndex].updatedAt = new Date();
        writeTasks(tasks);
        console.log(`Task ${taskId} updated successfully.`);
    } else {
        console.log(`Task with ID ${taskId} not found.`);
    }
}

function deleteTask(taskId) {
    let tasks = readTasks();
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id != taskId);

    if (tasks.length < initialLength) {
        writeTasks(tasks);
        console.log(`Task ${taskId} deleted successfully.`);
    } else {
        console.log(`Task with ID ${taskId} not found.`);
    }
}

function changeStatus(taskId, newStatus) {
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id == taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        tasks[taskIndex].updatedAt = new Date();
        writeTasks(tasks);
        console.log(`Task ${taskId} marked as ${newStatus}.`);
    } else {
        console.log(`Task with ID ${taskId} not found.`);
    }
}

function listTasks(statusNeeded) {
    const tasks = readTasks();

    if (statusNeeded) {
        const filteredTasks = tasks.filter(task => task.status === statusNeeded);
        console.log(filteredTasks);
    } else {
        console.log(tasks);
    }
}

function getTaskDescription(input) {
    const startIndex = input.indexOf('"') + 1;
    const endIndex = input.lastIndexOf('"');
    return input.slice(startIndex, endIndex);
}

start();
