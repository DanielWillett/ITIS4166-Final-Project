# Testing Plan
Provides steps to use for grading.

**First, switch the server to the production server in Swagger UI.**

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

Removes an item category and all it's children.

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









## Stock Items
CRUD operations for stock items.

Stock items represent a physical group of items from one vendor. They also store the physical location of the item.

> [!NOTE]
> All endpoints require an authentication token.

### Stock Item Model
```ts
id: number,
item: number, // FK to Item
quantity: number,
manufacturer: string | null,
vendor: string | null,
url: string | null,
location: string,
createdBy: number | null, // FK to User
createdAt: Date
```

### List: `GET /stock-items`

Queries the list of all stock items.

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
// GET /stock-items -> 200 OK
[
  {
    "id": 1,
    "item": 1,
    "quantity": "495",
    "manufacturer": "Kanebridge",
    "vendor": "DigiKey",
    "url": "https://www.digikey.com/en/products/detail/fix-supply/5032BHH7/21649245",
    "location": "Bldg 1A, Room 114, Shelf 3",
    "createdAt": "2026-05-01T22:55:34.982Z",
    "createdBy": 1
  },
  {
    "id": 2,
    "item": 1,
    "quantity": "11",
    "manufacturer": "Generic",
    "vendor": "Amazon",
    "url": "https://www.amazon.com/Heavy-Bolt-Grade-Plain-ECS-5032BHH7/dp/B0CVNLHBY6",
    "location": "Bldg 1A, Room 120, Desk 4",
    "createdAt": "2026-05-01T22:55:58.019Z",
    "createdBy": 1
  },
  {
    "id": 3,
    "item": 2,
    "quantity": "6",
    "manufacturer": null,
    "vendor": "Walmart",
    "url": null,
    "location": "Bldg 1A, Room 11",
    "createdAt": "2026-05-01T22:44:12.684Z",
    "createdBy": 2
  }
]
```

> [!NOTE]
> Feel free to try searching, sorting, or paginating with the query parameters but it's too much to put in here for each endpoint. 

Formatting issues
```jsonc
// GET /stock-items?orderBy=vendor&sort=1234 -> 400 Bad Request
{
  "errors": [
    "'sort' parameter must be either 'asc' or 'desc'."
  ]
}
```
Not logged in
```jsonc
// GET /stock-items -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```

### Create: `POST /stock-items`

Creates a new stock item.

> [!IMPORTANT]
> Requires write access.

#### Body
```jsonc
{
  "item": 1,
  "quantity": 86,
  "manufacturer": "CDE Fasteners",
  "vendor": "CDE Fasteners",
  "url": "https://cdefasteners.com/order-online/heavy-hex-bolt-grade-b7-astm-a193-plain/476910",
  "location": "Rob's desk (again)"
}
```

Creating a stock item will also add a Stock Item Record for its creation.

#### Responses

Success
```jsonc
// POST /stock-items -> 201 Created
{
  "id": 4,
  "item": 1,
  "quantity": "86",
  "manufacturer": "CDE Fasteners",
  "vendor": "CDE Fasteners",
  "url": "https://cdefasteners.com/order-online/heavy-hex-bolt-grade-b7-astm-a193-plain/476910",
  "location": "Rob's desk (again)",
  "createdAt": "2026-05-02T01:22:30.345Z",
  "createdBy": 1
}
```
Missing/invalid properties or invalid ID
```jsonc
// POST /stock-items -> 400 Bad Request
{
  "errors": [
    "'location' parameter is required."
  ]
}
```
Not logged in
```jsonc
// POST /stock-items -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Missing write permission
```jsonc
// POST /stock-items -> 403 Forbidden
{
  "error": "Unauthorized, requires write access."
}
```

### Read: `GET /stock-items/<id>`

Queries a specific stock item by its ID.

#### Responses

Success
```jsonc
// GET /stock-items/1 -> 200 OK
{
  "id": 1,
  "item": 1,
  "quantity": "495",
  "manufacturer": "Kanebridge",
  "vendor": "DigiKey",
  "url": "https://www.digikey.com/en/products/detail/fix-supply/5032BHH7/21649245",
  "location": "Bldg 1A, Room 114, Shelf 3",
  "createdAt": "2026-05-01T22:55:34.982Z",
  "createdBy": 1
}
```
Invalid ID
```jsonc
// GET /stock-items/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// GET /stock-items/1 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Non-existant ID
```jsonc
// GET /stock-items/4166 -> 404 Not Found
{
  "error": "Stock Item 4166 not found."
}
```

### Update: `PATCH /stock-items/<id>`

Updates information about a specific stock item by its ID, returning the updated object.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Body
Include one or more of the following:
```jsonc
{
  "quantity": 14,
  "manufacturer": "3M",
  "vendor": "DigiKey",
  "url": "https://www.digikey.com/en/products/detail/panduit-corp/S1224-C/4578558",
  "location": "John took it home again"
}
```

Modifying a stock item will also add a Stock Item Record for each property changed.

#### Responses

Success
```jsonc
// PATCH /stock-items/2 -> 200 OK
{
  "id": 2,
  "item": 1,
  "quantity": "14",
  "manufacturer": "3M",
  "vendor": "DigiKey",
  "url": "https://www.digikey.com/en/products/detail/panduit-corp/S1224-C/4578558",
  "location": "John took it home again",
  "createdAt": "2026-05-01T22:55:58.019Z",
  "createdBy": 1
}
```
Missing/invalid properties or invalid ID
```jsonc
// PATCH /stock-items/2 -> 400 Bad Request
{
  "errors": [
    "At least one of the following fields must be updated: [ quantity, manufacturer, vendor, url, location ]."
  ]
}
```
Not logged in
```jsonc
// PATCH /stock-items/2 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// PATCH /stock-items/2 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// PATCH /stock-items/4166 -> 404 Not Found
{
  "error": "Stock Item 4166 not found."
}
```

### Remove: `DELETE /stock-items/<id>`

Removes a stock item and all its records.

> [!IMPORTANT]
> Requires administrator permissions or to be ran on an object created by the currently logged in user that has write access.

#### Responses

Success
```jsonc
// DELETE /stock-items/3 -> 204 No Content
// (no response)
```
Invalid ID
```jsonc
// DELETE /stock-items/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// DELETE /stock-items/3 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Not administrator or self
```jsonc
// DELETE /stock-items/3 -> 403 Forbidden
{
  "error": "Unauthorized, requires administrator access or ownership of resource."
}
```
Non-existant ID
```jsonc
// DELETE /stock-items/4166 -> 404 Not Found
{
  "error": "Stock Item 4166 not found."
}
```









## Stock Item Records
Read operations for stock item records.

Stock item records record changes to stock items. They are automatically created so they're read-only from the API.

> [!NOTE]
> All endpoints require an authentication token.

### Stock Item Record Model
```ts
id: number,
stockItem: number, // FK to StockItem
fieldId: number,  // 0=initial-creation, 1=quantity, 2=manufacturer, 3=vendor, 4=url, 5=location
description: string,
oldValue: string,
user: number | null, // FK to User
timestamp: Date
```

### List: `GET /stock-item-records`

Queries the list of all stock items.

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
// GET /stock-item-records -> 200 OK
[
  {
    "id": 1,
    "stockItem": 1,
    "fieldId": 0,
    "description": "Created",
    "oldValue": "",
    "user": 1,
    "timestamp": "2026-05-01T22:55:34.982Z"
  },
  {
    "id": 2,
    "stockItem": 2,
    "fieldId": 0,
    "description": "Created",
    "oldValue": "",
    "user": 1,
    "timestamp": "2026-05-01T22:55:58.019Z"
  },
  {
    "id": 3,
    "stockItem": 2,
    "fieldId": 1,
    "description": "Property quantity changed to '11'",
    "oldValue": "12",
    "user": 2,
    "timestamp": "2026-05-01T23:01:12.304Z"
  },
  {
    "id": 4,
    "stockItem": 3,
    "fieldId": 0,
    "description": "Created",
    "oldValue": "",
    "user": 2,
    "timestamp": "2026-05-01T22:44:12.684Z"
  },
  {
    "id": 5,
    "stockItem": 3,
    "fieldId": 5,
    "description": "Property location changed to 'Bldg 1A, Room 11'",
    "oldValue": "Bldg 1A, Room 4",
    "user": 1,
    "timestamp": "2026-05-02T05:04:46.011Z"
  }
]
```

> [!NOTE]
> Feel free to try searching, sorting, or paginating with the query parameters but it's too much to put in here for each endpoint. 

Formatting issues
```jsonc
// GET /stock-item-records?orderBy=fieldId&sort=1234 -> 400 Bad Request
{
  "errors": [
    "'sort' parameter must be either 'asc' or 'desc'."
  ]
}
```
Not logged in
```jsonc
// GET /stock-item-records -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```

### Read: `GET /stock-item-records/<id>`

Queries a specific stock item by its ID.

#### Responses

Success
```jsonc
// GET /stock-item-records/5 -> 200 OK
{
  "id": 5,
  "stockItem": 3,
  "fieldId": 5,
  "description": "Property location changed to 'Bldg 1A, Room 11'",
  "oldValue": "Bldg 1A, Room 4",
  "user": 1,
  "timestamp": "2026-05-02T05:04:46.011Z"
}
```
Invalid ID
```jsonc
// GET /stock-item-records/abc -> 400 Bad Request
{
  "errors": [
    "'id' parameter must be an integer >= 1."
  ]
}
```
Not logged in
```jsonc
// GET /stock-item-records/5 -> 401 Unauthorized
{
  "error": "Unable to authenticate, missing bearer token."
}
```
Non-existant ID
```jsonc
// GET /stock-item-records/4166 -> 404 Not Found
{
  "error": "Stock Item Record 4166 not found."
}
```