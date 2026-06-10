package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/deinsteins/pasarin-web/backend/internal/auth"
	addressHandler "github.com/deinsteins/pasarin-web/backend/internal/address/handler"
	addressRepository "github.com/deinsteins/pasarin-web/backend/internal/address/repository"
	addressService "github.com/deinsteins/pasarin-web/backend/internal/address/service"
	cartHandler "github.com/deinsteins/pasarin-web/backend/internal/cart/handler"
	cartRepository "github.com/deinsteins/pasarin-web/backend/internal/cart/repository"
	cartService "github.com/deinsteins/pasarin-web/backend/internal/cart/service"
	categoryHandler "github.com/deinsteins/pasarin-web/backend/internal/category/handler"
	"github.com/deinsteins/pasarin-web/backend/internal/category/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/category/service"
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/middleware"
	productHandler "github.com/deinsteins/pasarin-web/backend/internal/product/handler"
	productRepository "github.com/deinsteins/pasarin-web/backend/internal/product/repository"
	productService "github.com/deinsteins/pasarin-web/backend/internal/product/service"
	sellerHandler "github.com/deinsteins/pasarin-web/backend/internal/seller/handler"
	sellerRepository "github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
	sellerService "github.com/deinsteins/pasarin-web/backend/internal/seller/service"
	"github.com/deinsteins/pasarin-web/backend/internal/upload"
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
	categoryHandler := categoryHandler.NewCategoryHandler(categoryService)

	sellerRepo := sellerRepository.NewSellerRepository(db)
	sellerService := sellerService.NewSellerService(sellerRepo)
	sellerHandler := sellerHandler.NewSellerHandler(sellerService)

	productRepo := productRepository.NewProductRepository(db)
	productService := productService.NewProductService(productRepo)
	productHandler := productHandler.NewProductHandler(productService)

	addressRepo := addressRepository.NewAddressRepository(db)
	addressService := addressService.NewAddressService(addressRepo)
	addressHandler := addressHandler.NewAddressHandler(addressService)

	cartRepo := cartRepository.NewCartRepository(db)
	cartService := cartService.NewCartService(cartRepo)
	cartHandler := cartHandler.NewCartHandler(cartService)

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

	app.Post("/api/products", productHandler.Create)
	app.Get("/api/products", productHandler.GetAll)
	app.Get("/api/products/:id", productHandler.GetByID)
	app.Put("/api/products/:id", productHandler.Update)
	app.Delete("/api/products/:id", productHandler.Delete)

	app.Post("/api/addresses", middleware.JWTAuthMiddleware(), addressHandler.Create)
	app.Get("/api/addresses", middleware.JWTAuthMiddleware(), addressHandler.GetAll)
	app.Get("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.GetByID)
	app.Put("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.Update)
	app.Delete("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.Delete)

	app.Post("/api/cart/items", middleware.JWTAuthMiddleware(), cartHandler.AddToCart)
	app.Get("/api/cart", middleware.JWTAuthMiddleware(), cartHandler.GetCart)
	app.Put("/api/cart/items/:id", middleware.JWTAuthMiddleware(), cartHandler.UpdateCartItem)
	app.Delete("/api/cart/items/:id", middleware.JWTAuthMiddleware(), cartHandler.DeleteCartItem)

	// Upload
	uploadService := upload.NewUploadService()
	uploadHandler := upload.NewUploadHandler(uploadService)
	app.Post("/api/uploads", uploadHandler.Upload)

	app.Get("/health", func(c *fiber.Ctx) error {	
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Swagger JSON endpoint
	app.Get("/swagger.json", func(c *fiber.Ctx) error {
		return c.SendFile("./docs/swagger.json")
	})

	// Swagger UI redirect
	app.Get("/swagger", func(c *fiber.Ctx) error {
		return c.SendFile("./docs/index.html")
	})

	// Serve Swagger UI static files
	app.Static("/swagger-ui", "./docs")

	log.Fatal(app.Listen(":3000"))
}