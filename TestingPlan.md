# Testing Plan
Provides steps to use for grading.

## Auth
Authentication consists of logging in and creating a new user.

### Log-in: `POST /auth/login`

All endpoints except login are protected to some degree so you must log in first.

Logging in will return a an object like this:
```jsonc
// 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

The token can be copied into the modal that shows up when you click Authorize at the top of the Swagger UI to gain access to other endpoints.

#### Users
The following users are available in the seed data:

##### John Doe (administrator)
```jsonc
// POST /auth/login -> 200 OK
{
  "username": "jodo",
  "password": "pword"
}
```

##### Jane Smith (standard write access)
```jsonc
// POST /auth/login -> 200 OK
{
  "username": "jsmithy",
  "password": "1234"
}
```

##### Guest User (read-only access)
```jsonc
// POST /auth/login -> 200 OK
{
  "username": "guest",
  "password": "$guest$"
}
```

#### Errors

If an invalid username or password is entered, expect a response like:
```jsonc
// 401 Unauthorized
{
  "error": "Invalid credentials."
}
```
If username and/or password properties are excluded, expect a response like:
```jsonc
// 400 Bad Request
{
  "errors": [
    "'username' parameter is required.",
    "'password' parameter is required."
  ]
}
```

### Sign-up: `POST /auth/create-user`

Creates a new user given a username, password, and full name.

> [!IMPORTANT]
> Requires administrator permissions.

#### Body
```jsonc
{
  "firstName": "Andrew",
  "lastName": "Lane",
  "username": "alane",
  "password": "pass!",
  "role": "write"
}
```

#### Responses
Success
```jsonc
// POST /auth/create-user -> 201 Created
{
  "id": 3,
  "firstName": "Andrew",
  "lastName": "Lane",
  "username": "alane",
  "createdBy": 1,
  "createdAt": "2026-05-01T23:38:23.970Z",
  "role": "write"
}
```
Formatting issues
```jsonc
// POST /auth/create-user -> 400 Bad Request
{
  "errors": [
    "'username' parameter is required.",
    "'password' parameter is required."
  ]
}
```
Not logged in
```jsonc
// POST /auth/create-user -> 401 Bad Request
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator
```jsonc
// POST /auth/create-user -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access."
}
```
Duplicate username
```jsonc
// POST /auth/create-user -> 409 Conflict
{
  "error": "Username already used."
}
```









## Users
CRUD (sorta) operations for Users.

> [!NOTE]
> All endpoints require an authentication token.

### User Model
```ts
id: number,
firstName: string,
lastName: string,
username: string,
createdBy: number | null, // FK to User
createdAt: Date,
role: "read" | "write" | "admin"
```

### List: `GET /users`

Queries the list of all users, returning them without their passwords.

#### URL Query Parameters

| Parameter  | Type                 | Description                                 |
| ---------- | -------------------- | ------------------------------------------- |
| `offset`   | int >= 0             | Pagination offset.                          |
| `limit`    | int >= -1            | Page size, or -1 for infinte.               |
| `searchBy` | string or "realName" | Property to search by.                      |
| `search`   | string               | Text to search for within `searchBy` value. |
| `orderBy`  | string               | Property to order results by.               |
| `sort`     | asc \| desc          | Ascending or descending.                    |

#### Responses
Successes
```jsonc
// GET /users -> 200 OK
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "jodo",
    "createdBy": null,
    "createdAt": "2026-04-29T00:26:52.198Z",
    "role": "admin"
  },
  {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "jsmithy",
    "createdBy": 1,
    "createdAt": "2026-04-29T00:30:49.928Z",
    "role": "write"
  },
  {
    "id": 3,
    "firstName": "Guest",
    "lastName": "User",
    "username": "guest",
    "createdBy": 1,
    "createdAt": "2026-05-01T04:18:21.542Z",
    "role": "read"
  }
]
```
Success with search
```jsonc
// GET /users?searchBy=username&search=guest -> 200 OK
[
  {
    "id": 3,
    "firstName": "Guest",
    "lastName": "User",
    "username": "guest",
    "createdBy": 1,
    "createdAt": "2026-05-01T04:18:21.542Z",
    "role": "read"
  }
]
```
Success with pagination
```jsonc
// GET /users?offset=1&limit=1 -> 200 OK
[
  {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "jsmithy",
    "createdBy": 1,
    "createdAt": "2026-04-29T00:30:49.928Z",
    "role": "write"
  }
]
```
Success with sorting
```jsonc
// GET /users?orderBy=firstName&sort=asc -> 200 OK
[
  {
    "id": 3,
    "firstName": "Guest",
    "lastName": "User",
    "username": "guest",
    "createdBy": 1,
    "createdAt": "2026-05-01T04:18:21.542Z",
    "role": "read"
  },
  {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "jsmithy",
    "createdBy": 1,
    "createdAt": "2026-04-29T00:30:49.928Z",
    "role": "write"
  },
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "jodo",
    "createdBy": null,
    "createdAt": "2026-04-29T00:26:52.198Z",
    "role": "admin"
  }
]
```
Formatting issues
```jsonc
// GET /users?orderBy=firstName&sort=1234 -> 400 Bad Request
{
  "errors": [
    "'sort' parameter must be either 'asc' or 'desc'."
  ]
}
```
Not logged in
```jsonc
// GET /users -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```

### Read: `GET /users/<id>`

Queries a specific user by their ID, returning them without their passwords.

#### Responses

Success
```jsonc
// GET /users/1 -> 200 OK
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "username": "jodo",
  "createdBy": null,
  "createdAt": "2026-04-29T00:26:52.198Z",
  "role": "admin"
}
```
Invalid ID
```jsonc
// GET /users/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// GET /users/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Non-existant ID
```jsonc
// GET /users/4166 -> 404 Not Found
{
  "error": "User 4166 not found."
}
```

### Update: `PATCH /users/<id>`

Updates information about a specific user by their ID, returning them without their passwords.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on the currently logged in user that has write access.

#### Body
Include one or more of the following:
```jsonc
{
  "firstName": "Jenny",
  "lastName": "Johnson",
  "role": "read"
}
```

#### Responses

Success
```jsonc
// PATCH /users/2 -> 200 OK
{
  "id": 2,
  "firstName": "Jenny",
  "lastName": "Johnson",
  "username": "jsmithy",
  "createdBy": 1,
  "createdAt": "2026-04-29T00:30:49.928Z",
  "role": "read"
}
```
Missing/invalid properties or invalid ID
```jsonc
// PATCH /users/2 -> 400 Bad Request
{
  "errors": [
    "At least one of the following fields must be updated: [ firstName, lastName, role ]."
  ]
}
```
Not logged in
```jsonc
// PATCH /users/2 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// PATCH /users/2 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// PATCH /users/4166 -> 404 Not Found
{
  "error": "User 4166 not found."
}
```









## Items
CRUD operations for items.

Items are a high-level entry in an inventory, such as 'Paper Towels'.

Each item has a list of Stock Items which are specific instances of items, such as "6 pack of Walmart-brand Paper Towels" in "Bathroom Shelf B".

> [!NOTE]
> All endpoints require an authentication token.

### Item Model
```ts
id: number,
name: string,
description: string,
createdBy: number | null, // FK to User
createdAt: Date,
category: number // FK to ItemCategory
```

### List: `GET /items`

Queries the list of all items.

#### URL Query Parameters

| Parameter  | Type                 | Description                                 |
| ---------- | -------------------- | ------------------------------------------- |
| `offset`   | int >= 0             | Pagination offset.                          |
| `limit`    | int >= -1            | Page size, or -1 for infinte.               |
| `searchBy` | string or "realName" | Property to search by.                      |
| `search`   | string               | Text to search for within `searchBy` value. |
| `orderBy`  | string               | Property to order results by.               |
| `sort`     | asc \| desc          | Ascending or descending.                    |

#### Responses
Successes
```jsonc
// GET /items -> 200 OK
[
  {
    "id": 1,
    "name": "BOLT HEX HEAD HEX SOCKET 1/2\"-13",
    "description": "1/2\"-13 Hex Head Bolt Hex Socket Drive Steel",
    "category": 4,
    "createdAt": "2026-05-01T22:55:12.181Z",
    "createdBy": 1
  },
  {
    "id": 2,
    "name": "Paper Towels",
    "description": "1 roll of paper towels",
    "category": 8,
    "createdAt": "2026-05-01T22:44:08.418Z",
    "createdBy": 2
  }
]
```

> [!NOTE]
> Feel free to try searching, sorting, or paginating with the query parameters but it's too much to put in here for each endpoint. 

Formatting issues
```jsonc
// GET /items?orderBy=firstName&sort=1234 -> 400 Bad Request
{
  "errors": [
    "'sort' parameter must be either 'asc' or 'desc'."
  ]
}
```
Not logged in
```jsonc
// GET /items -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```

### Create: `POST /items`

Creates a new item

> [!IMPORTANT]
> Requires write access.

#### Body
```jsonc
{
  "name": "My new item",
  "description": "Description for that item",
  "category": 2
}
```

#### Responses

Success
```jsonc
// POST /items -> 201 Created
{
  "id": 3,
  "name": "My new item",
  "description": "Description for that item",
  "category": 2,
  "createdAt": "2026-05-02T00:22:00.103Z",
  "createdBy": 1
}
```
Missing/invalid properties or invalid ID
```jsonc
// POST /items -> 400 Bad Request
{
  "errors": [
    "'description' parameter is required."
  ]
}
```
Not logged in
```jsonc
// POST /items -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Missing write permission
```jsonc
// POST /items -> 403 Forbidden
{
  "error": "Unauthorized, requires write access."
}
```

### Read: `GET /items/<id>`

Queries a specific item by its ID.

#### Responses

Success
```jsonc
// GET /items/1 -> 200 OK
{
  "id": 1,
  "name": "BOLT HEX HEAD HEX SOCKET 1/2\"-13",
  "description": "1/2\"-13 Hex Head Bolt Hex Socket Drive Steel",
  "category": 4,
  "createdAt": "2026-05-01T22:55:12.181Z",
  "createdBy": 1
}
```
Invalid ID
```jsonc
// GET /items/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// GET /items/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Non-existant ID
```jsonc
// GET /items/4166 -> 404 Not Found
{
  "error": "Item 4166 not found."
}
```

### Update: `PATCH /items/<id>`

Updates information about a specific item by its ID, returning the updated object.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Body
Include one or more of the following:
```jsonc
{
  "name": "Updated item",
  "description": "Description for updated item.",
  "category": 1
}
```

#### Responses

Success
```jsonc
// PATCH /items/2 -> 200 OK
{
  "id": 2,
  "name": "Updated item",
  "description": "Description for updated item.",
  "category": 1,
  "createdAt": "2026-05-01T22:44:08.418Z",
  "createdBy": 2
}
```
Missing/invalid properties or invalid ID
```jsonc
// PATCH /items/2 -> 400 Bad Request
{
  "errors": [
    "At least one of the following fields must be updated: [ name, description, category ]."
  ]
}
```
Not logged in
```jsonc
// PATCH /items/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// PATCH /items/1 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// PATCH /items/4166 -> 404 Not Found
{
  "error": "Item 4166 not found."
}
```

### Remove: `DELETE /items/<id>`

Removes an item and all it's stock items.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Responses

Success
```jsonc
// DELETE /items/2 -> 204 No Content
// (no response)
```
Invalid ID
```jsonc
// DELETE /items/2 -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// DELETE /items/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// DELETE /items/1 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// DELETE /items/4166 -> 404 Not Found
{
  "error": "Item 4166 not found."
}
```









## Item Categories
CRUD operations for item categories.

Categories can create a folder-like structure for items.

The seed data contains the following categories:
```
| Hardware
|   Bolts
|     Nylon
|     Metal
|   Nuts
|   Washers
| Office Supplies
|   Cleaning
|   Cooking
```

> [!NOTE]
> All endpoints require an authentication token.

### Item Category Model
```ts
id: number,
name: string,
parent: number | null, // FK to ItemCategory
createdBy: number | null, // FK to User
createdAt: Date
```

### List: `GET /item-categories`

Queries the list of all item categories.

#### URL Query Parameters

| Parameter  | Type                 | Description                                 |
| ---------- | -------------------- | ------------------------------------------- |
| `offset`   | int >= 0             | Pagination offset.                          |
| `limit`    | int >= -1            | Page size, or -1 for infinte.               |
| `searchBy` | string or "realName" | Property to search by.                      |
| `search`   | string               | Text to search for within `searchBy` value. |
| `orderBy`  | string               | Property to order results by.               |
| `sort`     | asc \| desc          | Ascending or descending.                    |

#### Responses
Successes
```jsonc
// GET /item-categories -> 200 OK
[
  {
    "id": 1,
    "name": "Hardware",
    "parent": null,
    "createdBy": 1,
    "createdAt": "2026-05-01T19:11:36.148Z"
  },
  {
    "id": 2,
    "name": "Bolts",
    "parent": 1,
    "createdBy": 2,
    "createdAt": "2026-05-01T19:14:49.482Z"
  },
  {
    "id": 3,
    "name": "Nylon",
    "parent": 2,
    "createdBy": 2,
    "createdAt": "2026-05-01T19:15:17.094Z"
  },
  {
    "id": 4,
    "name": "Metal",
    "parent": 2,
    "createdBy": 2,
    "createdAt": "2026-05-01T19:15:20.481Z"
  },
  {
    "id": 5,
    "name": "Nuts",
    "parent": 1,
    "createdBy": 2,
    "createdAt": "2026-05-01T19:16:00.144Z"
  },
  {
    "id": 6,
    "name": "Washers",
    "parent": 1,
    "createdBy": 2,
    "createdAt": "2026-05-01T19:16:32.748Z"
  },
  {
    "id": 7,
    "name": "Office Supplies",
    "parent": null,
    "createdBy": 1,
    "createdAt": "2026-05-01T19:12:25.927Z"
  },
  {
    "id": 8,
    "name": "Cleaning",
    "parent": 7,
    "createdBy": 1,
    "createdAt": "2026-05-01T19:13:14.181Z"
  },
  {
    "id": 9,
    "name": "Cooking",
    "parent": 7,
    "createdBy": 1,
    "createdAt": "2026-05-01T19:17:14.080Z"
  }
]
```

> [!NOTE]
> Feel free to try searching, sorting, or paginating with the query parameters but it's too much to put in here for each endpoint. 

Formatting issues
```jsonc
// GET /item-categories?orderBy=name&sort=1234 -> 400 Bad Request
{
  "errors": [
    "'sort' parameter must be either 'asc' or 'desc'."
  ]
}
```
Not logged in
```jsonc
// GET /item-categories -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```

### Create: `POST /item-categories`

Creates a new item category.

> [!IMPORTANT]
> Requires write access.

#### Body
Parent is optional.
```jsonc
{
  "name": "Gears",
  "parent": 1
}
```

#### Responses

Success
```jsonc
// POST /item-categories -> 201 Created
{
  "id": 10,
  "name": "Gears",
  "parent": 1,
  "createdBy": 2,
  "createdAt": "2026-05-02T00:52:31.366Z"
}
```
Missing/invalid properties or invalid ID
```jsonc
// POST /item-categories -> 400 Bad Request
{
  "errors": [
    "'name' parameter is required."
  ]
}
```
Not logged in
```jsonc
// POST /item-categories -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Missing write permission
```jsonc
// POST /item-categories -> 403 Forbidden
{
  "error": "Unauthorized, requires write access."
}
```

### Read: `GET /item-categories/<id>`

Queries a specific item category by its ID.

#### Responses

Success
```jsonc
// GET /item-categories/1 -> 200 OK
{
  "id": 1,
  "name": "Hardware",
  "parent": null,
  "createdBy": 1,
  "createdAt": "2026-05-01T19:11:36.148Z"
}
```
Invalid ID
```jsonc
// GET /item-categories/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// GET /item-categories/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Non-existant ID
```jsonc
// GET /item-categories/4166 -> 404 Not Found
{
  "error": "Item category 4166 not found."
}
```

### Update: `PATCH /item-categories/<id>`

Updates information about a specific item cateogory by its ID, returning the updated object.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Body
Include one or more of the following:
```jsonc
{
  "name": "Updated item",
  "description": "Description for updated item.",
  "category": 1
}
```

#### Responses

Success
```jsonc
// PATCH /item-categories/9 -> 200 OK
{
  "id": 9,
  "name": "Kitchen",
  "parent": null,
  "createdBy": 1,
  "createdAt": "2026-05-01T19:17:14.080Z"
}
```
Missing/invalid properties or invalid ID
```jsonc
// PATCH /item-categories/9 -> 400 Bad Request
{
  "errors": [
    "At least one of the following fields must be updated: [ name, parent ]."
  ]
}
```
Not logged in
```jsonc
// PATCH /item-categories/9 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// PATCH /item-categories/9 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// PATCH /item-categories/4166 -> 404 Not Found
{
  "error": "Item category 4166 not found."
}
```

### Remove: `DELETE /item-categories/<id>`

Removes an item category and all it's stock items.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Responses

Success
```jsonc
// DELETE /item-categories/9 -> 204 No Content
// (no response)
```
Invalid ID
```jsonc
// DELETE /item-categories/9 -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// DELETE /item-categories/9 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// DELETE /item-categories/9 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// DELETE /item-categories/4166 -> 404 Not Found
{
  "error": "Item category 4166 not found."
}
```