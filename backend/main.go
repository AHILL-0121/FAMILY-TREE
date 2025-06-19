package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/example/familytree-backend/models"
	"github.com/example/familytree-backend/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	dsn := os.Getenv("DB_USER") + ":" + os.Getenv("DB_PASS") + "@tcp(" + os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT") + ")/" + os.Getenv("DB_NAME") + "?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if os.Getenv("JWT_SECRET") == "" {
		os.Setenv("JWT_SECRET", "secret")
	}
	db.AutoMigrate(&models.FamilyTree{}, &models.Member{})

	app := fiber.New()

	// Enable CORS for all origins
	app.Use(cors.New())

	// Pass db to routes
	routes.Setup(app, db)

	log.Println("Server running on http://localhost:3001")
	log.Fatal(app.Listen(":3001"))
}
