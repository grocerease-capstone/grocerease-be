# GrocerEase Back-End Service

Backend service for the GrocerEase Mobile App.

## Technology
- **Node.js** (Production)
- **Nodemon** (Development and hot reload)

## Framework
- **ExpressJS**

## Tools
- **Sequelize** - ORM
- **JWT** - Access Token Management
- **Joi** - Request Body Validation
- **Multer** - File Upload Handling
- **Swagger** - API documentation
- **ESLint** - Linting: Dicoding - daStyle
- **Cloud SDK** - Google Cloud Product Access
- **MomentJS** - Date processing
- **Firebase Cloud Messaging** - Notification system

## Utilities
- **bcrypt** (Password hashing)
- **dotenv** (Environment Variables Management)
- **moment** (Date and Time Manipulation)
- **lodash** (Utility Functions)
- **uuid** (Unique ID Generation)

## Storage
- **MySQL**
- **Google Cloud Storage**

## Infrastructure
- **Google Cloud Platform**

## Folder Structure
```
grocerease-be/
├── src/
|   ├── config/
│   │   ├── firebase.js
│   │   ├── index.js
│   │   ├── orm.js
│   │   ├── server.js
│   │   └── storage.js
│   ├── controllers/
│   │   ├── auth_controller.js
│   │   ├── index.js
│   │   ├── list_controller.js
│   │   ├── share_request_controller.js
│   │   └── user_controller.js
│   ├── docs/
│   │   ├── authentication.yaml
│   │   ├── list.yaml
│   │   ├── share_request.yaml
│   │   └── user.yaml
│   ├── dto/
│   │   ├── request.js
│   │   └── response.js
│   ├── middlewares/
│   │   └── index.js
│   ├── models/
│   │   ├── definition.js
│   │   ├── index.js
│   │   ├── instance.js
│   │   ├── migrate.js
│   │   ├── relations.js
│   │   └── 
│   ├── routes/
│   │   ├── auth_routes.js
│   │   ├── index.js
│   │   ├── list_routes.js
│   │   ├── share_request_routes.js
│   │   └── user_routes.js
│   ├── utils/
│   │   ├── bcrypt.js
│   │   ├── fcm.js
│   │   ├── file_process.js
│   │   ├── index.js
│   │   └── jwt.js
│   ├── validators/
│   │   ├── auth_validator.js
│   │   ├── error_check.js
│   │   ├── list_validator.js
│   │   ├── share_request_validator.js
│   │   └── user_validator.js
│   └── app.js
├── .env
├── .eslintrc.json
├── .gitignore
└── package.json

```

# Structure Explanation
- **`src/`**: This is the main source folder containing all backend components.
- **`app.js`**: Located in `src/`, this file is the entry point for the backend service. It initializes the app, sets up routes, and starts the server.
- **Modular Components**: Every component i.e. middlewares, controllers etc. has its own `index.js` file for importing and exporting modules.
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
3. Setup Env for local deployment
    ```bash
    DB_HOST=your_host_ip
    DB_PORT=your_db_port
    DB_USER=your_username
    DB_PASSWORD=your_pass
    DB_NAME=your_db_name
    PORT=8080
    SOCKET_PATH= (Optional)
    CONNECTION_NAME= (Optional)

    JWT_TOKEN=your_jwt_token

    # Google Cloud Env
    GC_PROJECT_ID=your_project_id
    GC_STORAGE_BUCKET=your_bucket_name
    GC_KEY_FILE=path/to/service_account.json


    # Firebase Admin Service Account detail (Obtained from service_account.json)
    FCM_PROJECT_ID=your_project_id
    FCM_CLIENT_EMAIL=your_client_email
    FCM_PRIVATE_KEY=your_private_key (-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n)
    ```
4. Setup Migration

    Checkout src/models/migrate.js

    Make sure to uncomment one of these **three**:
    ```
    try {
      console.log('Running migrations...');
      // await sequelize.sync(); // Uncomment to create new table only
      // await sequelize.sync({ force: true }); // Uncomment to force delete and create all table
      // await sequelize.sync({ alter: true }); // Uncomment to alter and/or create new table
      console.log('Migrations completed successfully.');
    } 
    ```
    Checkout src/app.js

    Make sure to uncomment **await initDatabaseMigration()**:

    ```
    ...
    import { initDatabaseMigration } from './models/index.js';

    // await initDatabaseMigration(); // Run database migrations

    const routes = appRoutes(app);
    ...
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
    Make sure to comment **await initDatabaseMigration()** after first migration if you want to run with nodemon.
6. Prep Local Storage For Image Upload

    Create new directory in grocerease-be
    ```
    grocerease-be/
    ├── image_upload/
    │   ├── profile_images/
    │   ├── receipt_images/    
    │   └── thumbnail_images/
    ├── src/
    │   ├── config/
    │   ├── controllers/  
    │   └── ...
    ├── package.json
    └── README.md
    ```
    These directories are used to store images locally.

7. Checkout API Documentations in Swagger

    Checkout this endpoint to read our API Documentation.
    
    If you have deployed locally:
    ```bash
    http://localhost:3000/api-docs/
    ```

    If you haven't deployed locally:
    ```bash
    https://grocerease-be-407517281668.asia-southeast2.run.app/api-docs/
    ```
