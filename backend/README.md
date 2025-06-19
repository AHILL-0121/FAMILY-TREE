# Family Tree Backend

## Setup

1. Install Go (>=1.20)
2. Install MySQL and create a database named `familytree`.
3. Copy `.env` and set your DB credentials:

```
DB_USER=root
DB_PASS=yourpassword
DB_HOST=localhost
DB_PORT=3306
DB_NAME=familytree
```

4. Install dependencies:
```
go mod tidy
```

5. Run the server:
```
go run main.go
```

The API will be available at `http://localhost:3001/api/members`. 