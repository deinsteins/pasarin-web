package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/deinsteins/pasarin-web/backend/internal/auth"
	"github.com/deinsteins/pasarin-web/backend/internal/category/handler"
	"github.com/deinsteins/pasarin-web/backend/internal/category/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/category/service"
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/middleware"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/handler"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/service"
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

	categoryRepo := repository.NewCategoryRepository(db)
	categoryService := service.NewCategoryService(categoryRepo)
	categoryHandler := handler.NewCategoryHandler(categoryService)

	sellerRepo := repository.NewSellerRepository(db)
	sellerService := service.NewSellerService(sellerRepo)
	sellerHandler := handler.NewSellerHandler(sellerService)

	app := fiber.New()

	app.Post("/api/auth/register", authHandler.Register)
	app.Post("/api/auth/login", authHandler.Login)

	app.Get("/api/me", middleware.JWTAuthMiddleware(), authHandler.Me)

	app.Post("/api/categories", categoryHandler.Create)
	app.Get("/api/categories", categoryHandler.GetAll)
	app.Get("/api/categories/:id", categoryHandler.GetByID)
	app.Put("/api/categories/:id", categoryHandler.Update)
	app.Delete("/api/categories/:id", categoryHandler.Delete)

	app.Post("/api/sellers", sellerHandler.Create)
	app.Get("/api/sellers", sellerHandler.GetAll)
	app.Get("/api/sellers/:id", sellerHandler.GetByID)
	app.Put("/api/sellers/:id", sellerHandler.Update)
	app.Delete("/api/sellers/:id", sellerHandler.Delete)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	log.Fatal(app.Listen(":3000"))
}