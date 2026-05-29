package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/deinsteins/pasarin-web/backend/internal/auth"
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/middleware"
)

func main() {

	err := godotenv.Load()

	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatal(err)
	}

	authService := auth.NewAuthService(db)
	authHandler := auth.NewAuthHandler(authService)

	app := fiber.New()

	app.Post("/api/auth/register", authHandler.Register)
	app.Post("/api/auth/login", authHandler.Login)

	app.Get("/api/me", middleware.JWTAuthMiddleware(), authHandler.Me)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	log.Fatal(app.Listen(":3000"))
}