const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('GET /tasks', () => {
  test('should return all tasks', async () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const response = await request(app)
      .get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test('should return an empty array when there are no tasks', async () => {
    const response = await request(app)
      .get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('should filter tasks by status', async () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    taskService.create({
      title: 'Done task',
      status: 'done',
    });

    const response = await request(app)
      .get('/tasks?status=todo');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('todo');
  });
});

describe('GET /tasks pagination', () => {
  beforeEach(() => {
    for (let i = 1; i <= 25; i++) {
      taskService.create({
        title: `Task ${i}`,
      });
    }
  });

  test('should return the first page when page=1 and limit=10', async () => {
    const response = await request(app)
      .get('/tasks?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);

    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[9].title).toBe('Task 10');
  });

  test('should return the second page when page=2 and limit=10', async () => {
    const response = await request(app)
      .get('/tasks?page=2&limit=10');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);

    expect(response.body[0].title).toBe('Task 11');
    expect(response.body[9].title).toBe('Task 20');
  });
});

describe('POST /tasks', () => {
  test('should create a task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Build API',
        description: 'Complete assignment',
        status: 'todo',
        priority: 'high',
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Build API');
    expect(response.body.status).toBe('todo');
    expect(response.body.priority).toBe('high');
    expect(response.body.id).toBeDefined();
  });

  test('should reject a task without a title', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        description: 'No title',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should reject an invalid status', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Invalid status',
        status: 'invalid',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('status');
  });

  test('should reject an invalid priority', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Invalid priority',
        priority: 'urgent',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('priority');
  });
});

describe('PUT /tasks/:id', () => {
  test('should update an existing task', async () => {
    const task = taskService.create({
      title: 'Original title',
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: 'Updated title',
        priority: 'high',
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated title');
    expect(response.body.priority).toBe('high');
  });

  test('should return 404 for a non-existing task', async () => {
    const response = await request(app)
      .put('/tasks/does-not-exist')
      .send({
        title: 'Updated title',
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  test('should reject an invalid update', async () => {
    const task = taskService.create({
      title: 'Original title',
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        priority: 'urgent',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('priority');
  });
});

describe('DELETE /tasks/:id', () => {
  test('should delete an existing task', async () => {
    const task = taskService.create({
      title: 'Delete me',
    });

    const response = await request(app)
      .delete(`/tasks/${task.id}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test('should return 404 for a non-existing task', async () => {
    const response = await request(app)
      .delete('/tasks/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });
});

describe('PATCH /tasks/:id/complete', () => {
  test('should mark an existing task as completed', async () => {
    const task = taskService.create({
      title: 'Complete me',
      priority: 'high',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.priority).toBe('medium');
    expect(response.body.completedAt).toBeDefined();
  });

  test('should return 404 for a non-existing task', async () => {
    const response = await request(app)
      .patch('/tasks/does-not-exist/complete');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });
});

describe('GET /tasks/stats', () => {
  test('should return task statistics', async () => {
    taskService.create({
      title: 'Todo',
      status: 'todo',
    });

    taskService.create({
      title: 'Progress',
      status: 'in_progress',
    });

    taskService.create({
      title: 'Done',
      status: 'done',
    });

    taskService.create({
      title: 'Overdue',
      status: 'todo',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    const response = await request(app)
      .get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 2,
      in_progress: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('should return zero statistics when there are no tasks', async () => {
    const response = await request(app)
      .get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });
});









describe('PATCH /tasks/:id/assign', () => {
  test('should assign a task to a user', async () => {
    const task = taskService.create({
      title: 'Task to assign',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: 'Ranjit',
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.assignee).toBe('Ranjit');
  });

  test('should return 404 when the task does not exist', async () => {
    const response = await request(app)
      .patch('/tasks/does-not-exist/assign')
      .send({
        assignee: 'Ranjit',
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  test('should reject an empty assignee', async () => {
    const task = taskService.create({
      title: 'Task to assign',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should reject a whitespace-only assignee', async () => {
    const task = taskService.create({
      title: 'Task to assign',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: '   ',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should reject assigning an already assigned task', async () => {
    const task = taskService.create({
      title: 'Already assigned task',
    });

    await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: 'First User',
      });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({
        assignee: 'Second User',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});