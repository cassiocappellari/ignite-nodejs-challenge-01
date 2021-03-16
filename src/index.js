const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  );

  if(!user) {
    return response.status(404).json({ error: "user not found" });
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  )

  if(userAlreadyExists) {
    return response.status(400).json({ error: "user already exists!" });
  };

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const userTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if(!userTodo) {
    return response.status(404).json({ error: "todo not found" });
  };

  userTodo.title = title;
  userTodo.deadline = new Date(deadline);

  return response.status(201).json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if(!userTodo) {
    return response.status(404).json({ error: "todo not found" });
  };

  userTodo.done = true;

  return response.status(201).json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if(!userTodo) {
    return response.status(404).json({ error: "todo not found" });
  };

  user.todos.splice(user.todos.indexOf(userTodo), 1);

  response.status(204).send();
});

module.exports = app;