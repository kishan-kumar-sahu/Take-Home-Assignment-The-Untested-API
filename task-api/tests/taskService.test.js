const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('taskService.create', () => {
  test('should create a task with default values', () => {
    const task = taskService.create({
      title: 'Learn Jest',
    });

    expect(task).toMatchObject({
      title: 'Learn Jest',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      completedAt: null,
    });

    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  test('should create a task with provided values', () => {
    const task = taskService.create({
      title: 'Build API',
      description: 'Complete assignment',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-10-01T00:00:00.000Z',
    });

    expect(task).toMatchObject({
      title: 'Build API',
      description: 'Complete assignment',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-10-01T00:00:00.000Z',
    });
  });
});

describe('taskService.getAll', () => {
  test('should return all tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('should return an empty array when there are no tasks', () => {
    expect(taskService.getAll()).toEqual([]);
  });
});

describe('taskService.findById', () => {
  test('should find an existing task', () => {
    const created = taskService.create({ title: 'Find me' });

    const task = taskService.findById(created.id);

    expect(task).toEqual(created);
  });

  test('should return undefined for a non-existing task', () => {
    expect(taskService.findById('does-not-exist')).toBeUndefined();
  });
});

describe('taskService.getByStatus', () => {
  beforeEach(() => {
    taskService.create({ title: 'Todo task', status: 'todo' });
    taskService.create({
      title: 'Progress task',
      status: 'in_progress',
    });
    taskService.create({ title: 'Done task', status: 'done' });
  });

  test('should return tasks with the requested status', () => {
    const tasks = taskService.getByStatus('todo');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('todo');
  });

  test('should return an empty array for a status with no matches', () => {
    expect(taskService.getByStatus('invalid')).toEqual([]);
  });
});

describe('taskService.getPaginated', () => {
  beforeEach(() => {
    for (let i = 1; i <= 25; i++) {
      taskService.create({ title: `Task ${i}` });
    }
  });

  test('should return the first page of tasks', () => {
    const tasks = taskService.getPaginated(1, 10);

    expect(tasks).toHaveLength(10);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[9].title).toBe('Task 10');
  });

  test('should return the requested page', () => {
    const tasks = taskService.getPaginated(2, 10);

    expect(tasks).toHaveLength(10);
    expect(tasks[0].title).toBe('Task 11');
    expect(tasks[9].title).toBe('Task 20');
  });
});

describe('taskService.update', () => {
  test('should update an existing task', () => {
    const created = taskService.create({
      title: 'Original title',
    });

    const updated = taskService.update(created.id, {
      title: 'Updated title',
      priority: 'high',
    });

    expect(updated).toMatchObject({
      id: created.id,
      title: 'Updated title',
      priority: 'high',
    });
  });

  test('should return null when updating a non-existing task', () => {
    expect(
      taskService.update('does-not-exist', {
        title: 'Updated',
      })
    ).toBeNull();
  });
});

describe('taskService.remove', () => {
  test('should remove an existing task', () => {
    const created = taskService.create({
      title: 'Delete me',
    });

    expect(taskService.remove(created.id)).toBe(true);
    expect(taskService.findById(created.id)).toBeUndefined();
  });

  test('should return false for a non-existing task', () => {
    expect(taskService.remove('does-not-exist')).toBe(false);
  });
});

describe('taskService.completeTask', () => {
  test('should mark a task as completed', () => {
    const created = taskService.create({
      title: 'Complete me',
      priority: 'high',
    });

    const completed = taskService.completeTask(created.id);

    expect(completed.status).toBe('done');
    expect(completed.priority).toBe('medium');
    expect(completed.completedAt).toBeDefined();
  });

  test('should return null for a non-existing task', () => {
    expect(taskService.completeTask('does-not-exist')).toBeNull();
  });
});

describe('taskService.getStats', () => {
  test('should return counts by status and overdue count', () => {
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

    expect(taskService.getStats()).toEqual({
      todo: 2,
      in_progress: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('should return zero counts when there are no tasks', () => {
    expect(taskService.getStats()).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });
});