# GrocerEase Back-End Service

Backend service for the GrocerEase Mobile App.

## Technology
- **Node.js** (for Production)
- **Nodemon** (for Development and hot reload)

## Tools/Frameworks
- **Express** (web server)
- **Sequelize** (ORM)
- **JWT** (access token management)
- **Joi** (request body validation)
- **Multer** (file upload handling)
- **Swagger** (API documentation)
- **ESLint** (for linting)

## Utilities
- **bcrypt** (password hashing)
- **dotenv** (environment variables management)
- **moment** (date and time manipulation)
- **lodash** (utility functions)
- **uuid** (unique ID generation)

## Storage
- **MySQL**
- **Google Cloud Storage**

## Infrastructure
- **Google Cloud Platform**

## Folder Structure
```
├── src/
|   |
|   ├── config/
│   │   ├── firebase.js
│   │   ├── index.js
│   │   └── ...
│   ├── controllers/
│   │   ├── auth_controller.js
│   │   ├── index.js
│   │   └── ...
│   ├── docs/
│   │   ├── authentication.yaml
│   │   ├── list.yaml
│   │   └── ...
│   ├── dto/
│   │   ├── request.js
│   │   └── response.js
│   ├── middlewares/
│   │   ├── index.js
│   ├── models/
│   │   ├── definition.js
│   │   ├── index.js
│   │   ├── instance.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth_routes.js
│   │   ├── index.js
│   │   └── ...
│   ├── utils/
│   │   ├── bcrypt.js
│   │   ├── fcm.js
│   │   └── ...
│   ├── validators/
│   │   ├── auth_validator.js
│   │   ├── error_check.js
│   │   └── ...
│   └── app.js
├── .env
├── .eslintrc.json
├── .gitignore
└── package.json

```

# Structure Explanation
- **`src/`**: This is the main source folder containing all backend components.
- **`app.js`**: Located in `src/`, this file is the entry point for the backend service. It initializes the app, sets up routes, and starts the server.
- **Modular Components**: Each component, such as middlewares and controllers, has its own `index.js` file for importing and exporting modules.
- **Environment Variables**: Create your own `.env` file based on the provided `.env.example` file. This ensures that sensitive configuration data (e.g., database credentials, API keys) is securely managed.

### How to Install
1. Clone this repo, `cd` to the cloned repo and checkout to `dev`
    ```bash
    git clone https://github.com/grocerease-capstone/grocerease-be.git
    cd grocerease-be
    git checkout dev
    ```
2. Install dependencies
    ```bash
    npm install
    ```
3. Setup Env
    ```
    DB_HOST=your_host_ip  || 127.0.0.1 (Local Default)
    DB_PORT=your_db_port  || 3306 (Local Default)
    DB_USER=your_username || root (Local Default)
    DB_PASSWORD=your_pass || empty (Local Default)
    DB_NAME=your_db_name
    PORT=3000
    SOCKET_PATH=
    CONNECTION_NAME=

    JWT_TOKEN=

    FIREBASE_KEY_FILE=
    ```
4. Setup Migration

    Checkout src/models/migrate.js

    Make sure to uncomment one of these **two**:
    ```
    try {
      console.log('Running migrations...');
      // await sequelize.sync(); // Uncomment to create new table only
      // await sequelize.sync({ alter: true }); // Uncomment to alter and/or create new table
      console.log('Migrations completed successfully.');
    } 
    ```
    Checkout src/app.js

    Make sure to uncomment **initDatabaseMigration()**:

    ```
    try {
      // await initDatabaseMigration(); // Run database migrations

      appRoutes(app); // Apply routes
      ...
    }
    ```
5. Run the server
    
    Run with node
    ```bash
    npm run start
    ```
    Run with nodemon
    ```bash
    npm run start-dev
    ```
    Make sure to comment **initDatabaseMigration()** after first migration if you want to run with nodemon.
6. Prep Local Storage For Image Upload

    Create new directory in grocerease-be
    ```
    grocerease-be/
    ├── image_upload/
    │   ├── receipt_images/
    │   └── thumbnail_images/
    ├── src/
    │   ├── config/
    │   ├── controllers/  
    │   └── ...
    ├── package.json
    └── README.md
    ```
    These directories are used to store images.
