# Final Project Template
Final project for ITIS-4166 at UNC Charlotte.

## Build Instructions
Install dependencies.
```
npm i
```

Generate prisma client.
```
npx prisma generate
```

Compile typescript.
```
npx tsc
```

Create a .env file in the repo root and add the following to it:
```properties
PORT=8080
NODE_ENV=development
JWT_EXPIRES_IN=1h

# TODO:
DATABASE_URL=<postgres://.../...>
JWT_SECRET=<Some binary text>
```

Seed database
```
npm run seed:dev
```

Start server
```
npm run dev
```

Use a browser to access `http://localhost:8080/api-docs` to view the swagger UI while the server is running.

Implements the following API endpoints:
```
POST    /auth/login
POST    /auth/create-user

GET     /users
GET     /users/<id>
PATCH   /users/<id>

GET     /items
POST    /items
GET     /items/<id>
PATCH   /items/<id>
DELETE  /items/<id>

GET     /stock-items
POST    /stock-items
GET     /stock-items/<id>
PATCH   /stock-items/<id>
DELETE  /stock-items/<id>

GET     /item-categories
POST    /item-categories
GET     /item-categories/<id>
PATCH   /item-categories/<id>
DELETE  /item-categories/<id>

GET     /stock-item-records
GET     /stock-item-records/<id>
```

Look at the [Testing Plan](https://github.com/DanielWillett/ITIS4166-Final-Project/blob/master/TestingPlan.md) for more info.
