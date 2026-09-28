# Bug Report

## Bug 1: Pagination Starts from the Wrong Page

### Summary

The pagination logic in the Task Manager API uses a zero-based page calculation, while the public API expects pagination to start from page `1`.

As a result, requesting the first page skips the first set of tasks.

---

## 1. Expected Behavior

The API supports pagination using:

```http
GET /tasks?page=1&limit=10
```

When `page=1` and `limit=10`, the API should return the first 10 tasks.

Expected pagination behavior:

| Page   | Expected Tasks    |
| ------ | ----------------- |
| Page 1 | Task 1 – Task 10  |
| Page 2 | Task 11 – Task 20 |
| Page 3 | Task 21 – Task 25 |

---

## 2. Actual Behavior

The API skips the first page of tasks.

With 25 tasks:

| Request           | Actual Result     |
| ----------------- | ----------------- |
| `page=1&limit=10` | Task 11 – Task 20 |
| `page=2&limit=10` | Task 21 – Task 25 |

Therefore, the first 10 tasks cannot be retrieved using `page=1`.

---

## 3. How the Bug Was Discovered

The issue was identified while writing integration tests using **Jest and Supertest**.

The test created 25 tasks and requested:

```http
GET /tasks?page=1&limit=10
```

The test expected the first task in the response to be `Task 1`.

Instead, the API returned `Task 11`.

A second test requested:

```http
GET /tasks?page=2&limit=10
```

The expected response contained 10 tasks:

```text
Task 11 – Task 20
```

However, the API returned only 5 tasks:

```text
Task 21 – Task 25
```

These test failures exposed the pagination calculation bug.

---

## 4. Root Cause

The issue was in the `getPaginated` function inside:

```text
src/services/taskService.js
```

The original implementation calculated the offset as:

```js
const offset = page * limit;
```

This treats the page number as **zero-based**.

However, the API uses page numbers starting from **1**.

For example:

```text
page = 1
limit = 10

offset = 1 × 10
       = 10
```

Therefore, `Array.slice()` starts at index `10`, which corresponds to Task 11 instead of Task 1.

---

## 5. Fix Applied

The pagination offset was changed to:

```js
const offset = (page - 1) * limit;
```

This correctly converts the public one-based page number into a zero-based array offset.

The resulting behavior is:

```text
Page 1:
(1 - 1) × 10 = 0
→ Task 1 – Task 10

Page 2:
(2 - 1) × 10 = 10
→ Task 11 – Task 20
```

---

## 6. Tests That Exposed the Bug

The following integration tests identified the issue:

```text
GET /tasks pagination
  › should return the first page when page=1 and limit=10

GET /tasks pagination
  › should return the second page when page=2 and limit=10
```

The tests were written using **Supertest** and verify the API behavior from the HTTP layer.

---

## 7. Verification

After applying the fix:

* Page 1 correctly returns Task 1 – Task 10.
* Page 2 correctly returns Task 11 – Task 20.
* Page 3 correctly returns Task 21 – Task 25.
* The complete test suite passes successfully.

### Final Test Result

```text
Test Suites: 2 passed, 2 total
Tests:       41 passed, 41 total
```

### Coverage

```text
Statements: 87.5%
Branches:   80.41%
Functions:  87.5%
Lines:      86.41%
```

The pagination fix is therefore covered by automated integration tests and verified as part of the complete test suite.
