# 🗄️ Database Setup Instructions

## Prerequisites
- PostgreSQL 14+ installed
- Database admin access
- pgAdmin or command line access

## Quick Setup

### 1. Create Database
```sql
CREATE DATABASE mrhappy_db;
CREATE USER mrhappy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mrhappy_db TO mrhappy_user;
```

### 2. Run Schema
```bash
psql -U mrhappy_user -d mrhappy_db -f backend/database/schema.sql
```

### 3. Environment Variables
Create `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mrhappy_db
DB_USER=mrhappy_user
DB_PASSWORD=your_secure_password
DB_SSL=false
```

## Database Structure

### Core Tables
- **users** - User accounts and authentication
- **user_addresses** - Customer delivery addresses
- **user_sessions** - JWT token management
- **restaurants** - Restaurant information
- **menu_items** - Food items and pricing
- **orders** - Order management
- **notifications** - Real-time notifications

### Security Features
- ✅ Row Level Security (RLS) enabled
- ✅ Password hashing with bcrypt
- ✅ JWT session management
- ✅ Email verification system
- ✅ Password reset tokens
- ✅ Admin activity logging

### Performance Optimizations
- ✅ Strategic indexes on frequently queried columns
- ✅ Composite indexes for complex queries
- ✅ Materialized views for reporting
- ✅ Auto-updating timestamps with triggers

## Data Migration
1. Run schema.sql to create structure
2. Run seeds/initial_data.sql for test data
3. Run migrations in order for updates

## Backup Strategy
```bash
# Daily backup
pg_dump -U mrhappy_user mrhappy_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U mrhappy_user -d mrhappy_db < backup_20250905.sql
```

## Connection Testing
```bash
psql -U mrhappy_user -d mrhappy_db -c "SELECT version();"
```
