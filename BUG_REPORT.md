 Bug Report



\## Bug 1: Pagination starts from the wrong page



\### Expected Behavior



The API documentation supports pagination using:



`GET /tasks?page=1\&limit=10`



When `page=1` and `limit=10`, the API should return the first 10 tasks.



Expected:



\- page 1 → Task 1 to Task 10

\- page 2 → Task 11 to Task 20



\### Actual Behavior



The API skips the first page.



With 25 tasks:



\- page 1 → Task 11 to Task 20

\- page 2 → Task 21 to Task 25



\### How It Was Discovered



An integration test using Supertest created 25 tasks and requested:



`GET /tasks?page=1\&limit=10`



The test expected the first task to be `Task 1`, but the API returned `Task 11`.



A second test requested:



`GET /tasks?page=2\&limit=10`



and expected 10 tasks (`Task 11` to `Task 20`), but only 5 tasks were returned (`Task 21` to `Task 25`).



\### Root Cause



The `getPaginated` function calculates the offset using:



`page \* limit`



This treats the page number as zero-based, while the public API uses page numbers starting from 1.



\### Suggested Fix



Calculate the offset using:



`(page - 1) \* limit`



This makes page 1 start at index 0 and page 2 start at index 10.



\### Tests That Exposed the Bug



\- `GET /tasks pagination › should return the first page when page=1 and limit=10`

\- `GET /tasks pagination › should return the second page when page=2 and limit=10`

