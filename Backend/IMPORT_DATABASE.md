# How to Import gotrip_db_backup.sql into MySQL

This guide will help you import the database backup file into MySQL so you can connect DBeaver.

## Prerequisites

- ✅ MySQL server installed and running
- ✅ Database backup file: `gotrip_db_backup.sql` (already in Backend folder)

## Method 1: Import via MySQL Command Line (Recommended)

### Step 1: Start MySQL Service

1. Press `Win + R`, type `services.msc`, press Enter
2. Find `MySQL` or `MySQL80` service
3. Right-click → **Start** (if not running)

### Step 2: Open Command Prompt or PowerShell

Navigate to your Backend folder:
```powershell
cd C:\Users\admin\Downloads\dixit\dixit\Backend
```

### Step 3: Import the Database

**Option A: If MySQL is in your PATH:**
```bash
mysql -u root -p < gotrip_db_backup.sql
```

**Option B: If using XAMPP:**
```bash
C:\xampp\mysql\bin\mysql.exe -u root -p < gotrip_db_backup.sql
```

**Option C: If using WAMP:**
```bash
C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysql.exe -u root -p < gotrip_db_backup.sql
```

**Option D: If MySQL is installed but not in PATH:**
Find your MySQL installation (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin\`) and use:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < gotrip_db_backup.sql
```

### Step 4: Enter Password

When prompted, enter the MySQL root password: `mahekkk11`

### Step 5: Verify Import

Connect to MySQL and verify:
```bash
mysql -u root -p
```

Then run:
```sql
USE gotrip_db;
SHOW TABLES;
```

You should see tables like:
- admin
- auth_users
- bookings
- complaints
- contact_messages
- enquiry_messages
- password_resets
- payments
- routes
- schedules
- transactions
- users

## Method 2: Import via DBeaver (After MySQL is Running)

### Step 1: Connect to MySQL in DBeaver

1. Create a connection to MySQL (see `DBEAVER_SETUP.md`)
2. Connect to MySQL server (you don't need to select a database yet)

### Step 2: Create the Database

1. Right-click on your MySQL connection
2. Select **SQL Editor** → **New SQL Script**
3. Run:
   ```sql
   CREATE DATABASE IF NOT EXISTS gotrip_db;
   ```
4. Execute the script (F5 or click Execute button)

### Step 3: Import the SQL File

1. Right-click on `gotrip_db` database
2. Select **Tools** → **Execute Script**
3. Browse and select: `Backend\gotrip_db_backup.sql`
4. Click **Start**
5. Wait for import to complete

### Step 4: Verify Import

1. Expand `gotrip_db` database
2. Expand **Tables**
3. You should see all the tables listed

## Method 3: Import via MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to **Server** → **Data Import**
4. Select **Import from Self-Contained File**
5. Browse to: `Backend\gotrip_db_backup.sql`
6. Select **Default Target Schema** → `gotrip_db` (create if doesn't exist)
7. Click **Start Import**

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solution:**
- Verify password is correct: `mahekkk11`
- Try resetting MySQL root password if needed

### Error: "Unknown database 'gotrip_db'"

**Solution:**
The SQL file should create the database automatically, but if it doesn't:
```sql
CREATE DATABASE gotrip_db;
```
Then import again.

### Error: "MySQL server is not running"

**Solution:**
1. Start MySQL service (see Step 1 of Method 1)
2. Verify it's running: `netstat -an | findstr 3306`

### Error: "mysql: command not found"

**Solution:**
- Use full path to mysql.exe (see Option D in Method 1)
- Or add MySQL bin folder to your system PATH

### Import takes too long or hangs

**Solution:**
- Check if MySQL service is running properly
- Try importing via DBeaver (Method 2) which shows progress
- Check MySQL error logs for issues

## After Successful Import

1. ✅ Database `gotrip_db` is created
2. ✅ All tables are imported
3. ✅ You can now connect DBeaver to `gotrip_db`
4. ✅ Your backend application can connect to the database

## Next Steps

1. Connect DBeaver using the connection details:
   - Host: `localhost`
   - Port: `3306`
   - Database: `gotrip_db`
   - Username: `root`
   - Password: `mahekkk11`

2. Explore your database tables in DBeaver

3. Run your backend application - it should now connect successfully!

---

**File Location:** `Backend\gotrip_db_backup.sql`



