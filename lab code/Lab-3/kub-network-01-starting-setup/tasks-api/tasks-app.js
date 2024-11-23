const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create the tasks folder to store new tasks
// Need this to avoid an error later when trying to 
// write tasks.txt into this folder 
if (!fs.existsSync(process.env.TASKS_FOLDER)) {

  // If it doesn't exist, create the directory
  fs.mkdirSync(process.env.TASKS_FOLDER);
  console.log(`Directory '${process.env.TASKS_FOLDER}' created.`);
} else {
  console.log(`Directory '${process.env.TASKS_FOLDER}' already exists.`);
}


const filePath = path.join(__dirname, process.env.TASKS_FOLDER, 'tasks.txt');

const app = express();

app.use(bodyParser.json());

const extractAndVerifyToken = async (headers) => {

  if (!headers.authorization) {
    throw new Error('No token provided.');
  }
  const token = headers.authorization.split(' ')[1]; // expects Bearer TOKEN

  const response = await axios.get('http://auth/verify-token/' + token);
  return response.data.uid;
};

app.get('/tasks', async (req, res) => {
  
  console.log("GET to tasks API endpoint");
  
  try {
    // we don't really need the uid, just call the method to verify the token
    const uid = await extractAndVerifyToken(req.headers); 
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Loading the tasks failed.' });
      }
      const strData = data.toString();
      const entries = strData.split('TASK_SPLIT');
      entries.pop(); // remove last, empty entry
      console.log("List of tasks to be returned : " + entries);
      const tasks = entries.map((json) => JSON.parse(json));
      res.status(200).json({ message: 'Tasks loaded.', tasks: tasks });
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.message || 'Failed to load tasks.' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    
    console.log("POST to tasks API endpoint");
    
    // we don't really need the uid, just call the method to verify the token
    const uid = await extractAndVerifyToken(req.headers); 
    
    const text = req.body.text;
    const title = req.body.title;
    const task = { title, text };
    
    console.log("Task to store is : ", task);
    
    const jsonTask = JSON.stringify(task);
    fs.appendFile(filePath, jsonTask + 'TASK_SPLIT', (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Storing the task failed.' });
      }
      res.status(201).json({ message: 'Task stored.', createdTask: task });
    });
  } catch (err) {
    return res.status(401).json({ message: 'Could not verify token.' });
  }
});

app.listen(8000);
