# GrocerEase Back-End Service

Backend service for the GrocerEase Mobile App.

### How to Install locally.
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
    To fully utilize the features of the Backend, you first need to create an account and then login with the registered account. After logging in, you will be given a JWT token. This is the input format:
    1. Checkout .../api-docs/
    2. Click the **Authorize** button.
    3. Input in the value column:
    ```bash
    Bearer: <your_jwt_token>
    ```

    With the space in between. Make sure it is in this format, otherwise it won't be detected.
