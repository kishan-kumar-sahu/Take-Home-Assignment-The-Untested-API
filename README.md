# Take-Home Assignment — The Untested API

A 2-day take-home assignment. You'll read unfamiliar code, write tests, track down bugs, and ship a small feature.

Read **[ASSIGNMENT.md](./ASSIGNMENT.md)** for the full brief before you start.

---

## A note on AI tools

You're welcome to use AI tools. What we're evaluating is your ability to read and reason about unfamiliar code — so your submission should reflect your own understanding, not just generated output.

Concretely:
- For each bug you report: include where in the code it lives and why it happens
- For the feature you implement: briefly explain the design decisions you made
- If something surprised you or you had to make a tradeoff, say so

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
cd task-api
npm install
npm start        # runs on http://localhost:3000
```

**Tests:**

```bash
npm test           # run test suite
npm run coverage   # run with coverage report
```

### Creating a Task Using Thunder Client

1. Open **Thunder Client** in VS Code.
2. Select the **POST** method.
3. Enter the task API endpoint, for example:
   `http://localhost:3000/task`
4. Go to the **Body** section.
5. Select **JSON**.
6. Paste the following JSON:

```json
{
  "title": "Complete assignment",
  "description": "Finish API testing",
  "priority": "high"
}
```

7. Click **Send**.

If the request is successful, the task will be created and the API will return the created task in the response.


---

## Project Structure

```
Take-Home-Assignment-The-Untested-API/
│
├── BUG_REPORT.MD
├──.gitignore
├── ASSIGNMENT.md
├── README.md
│
└── task-api/
    │
    ├── package.json
    │
    ├── BUG_REPORT.md
    │
    ├── src/
    │   ├── app.js
    │   │
    │   ├── routes/
    │   │   └── tasks.js
    │   │
    │   ├── services/
    │   │   └── taskService.js
    │   │
    │   └── utils/
    │       └── validators.js
    │
    └── tests/
        ├── taskService.test.js
        └── tasks.api.test.js
```

> The data store is in-memory. It resets every time the server restarts.

---

## API Reference

| Method   | Path                      | Description                              |
|----------|---------------------------|------------------------------------------|
| `GET`    | `/tasks`                  | List all tasks. Supports `?status=`, `?page=`, `?limit=` |
| `POST`   | `/tasks`                  | Create a new task                        |
| `PUT`    | `/tasks/:id`              | Full update of a task                    |
| `DELETE` | `/tasks/:id`              | Delete a task (returns 204)              |
| `PATCH`  | `/tasks/:id/complete`     | Mark a task as complete                  |
| `GET`    | `/tasks/stats`            | Counts by status + overdue count         |
| `PATCH`  | `/tasks/:id/assign`       | **Assign a task to a user** _(to implement)_ |

### Task shape

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 or null",
  "completedAt": "ISO 8601 or null",
  "createdAt": "ISO 8601"
}
```

### Sample requests

**Create a task**
```bash
{
  "title": "Complete assignment",
  "description": "Finish API testing",
  "priority": "high"
}
```

**List tasks with filter**
```bash
curl "http://localhost:3000/tasks?status=pending&page=1&limit=10"
```

**Mark complete**
```bash
curl -X PATCH http://localhost:3000/tasks/<id>/complete
```

---

## What to Submit

See [ASSIGNMENT.md](./ASSIGNMENT.md) for full submission requirements. At minimum, include:

- **Test files** — covering the endpoints and edge cases you identified
- **Bug report** — what you found, where in the code, and why it's a bug (not just symptoms)
- **At least one fix** — with a note on your approach
- **`PATCH /tasks/:id/assign` implementation** — plus a short explanation of any design decisions (validation, edge cases, etc.)
