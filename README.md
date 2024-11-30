# GrocerEase Back-End Setup

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
    Checkout src/config/server.js

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
