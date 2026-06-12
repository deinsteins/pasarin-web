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
	checkoutHandler "github.com/deinsteins/pasarin-web/backend/internal/checkout/handler"
	checkoutService "github.com/deinsteins/pasarin-web/backend/internal/checkout/service"
	orderHandler "github.com/deinsteins/pasarin-web/backend/internal/order/handler"
	orderRepository "github.com/deinsteins/pasarin-web/backend/internal/order/repository"
	orderService "github.com/deinsteins/pasarin-web/backend/internal/order/service"
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
	payment "github.com/deinsteins/pasarin-web/backend/internal/payment"
	paymentHandler "github.com/deinsteins/pasarin-web/backend/internal/payment/handler"
	paymentRepository "github.com/deinsteins/pasarin-web/backend/internal/payment/repository"
	paymentService "github.com/deinsteins/pasarin-web/backend/internal/payment/service"
	inventoryHandler "github.com/deinsteins/pasarin-web/backend/internal/inventory/handler"
	inventoryRepository "github.com/deinsteins/pasarin-web/backend/internal/inventory/repository"
	inventoryService "github.com/deinsteins/pasarin-web/backend/internal/inventory/service"
	adminHandler "github.com/deinsteins/pasarin-web/backend/internal/admin/handler"
	adminRepository "github.com/deinsteins/pasarin-web/backend/internal/admin/repository"
	adminService "github.com/deinsteins/pasarin-web/backend/internal/admin/service"
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
	productService := productService.NewProductService(productRepo, sellerRepo)
	productHandler := productHandler.NewProductHandler(productService)

	addressRepo := addressRepository.NewAddressRepository(db)
	addressService := addressService.NewAddressService(addressRepo)
	addressHandler := addressHandler.NewAddressHandler(addressService)

	cartRepo := cartRepository.NewCartRepository(db)
	cartService := cartService.NewCartService(cartRepo)
	cartHandler := cartHandler.NewCartHandler(cartService)

	checkoutServiceInst := checkoutService.NewCheckoutService(db)
	checkoutHandlerInst := checkoutHandler.NewCheckoutHandler(checkoutServiceInst)

	orderRepo := orderRepository.NewOrderRepository(db)
	orderServiceInst := orderService.NewOrderService(orderRepo, sellerRepo)
	orderHandlerInst := orderHandler.NewOrderHandler(orderServiceInst)

	mayarProvider := payment.NewMayarProvider()
	paymentRepo := paymentRepository.NewPaymentRepository(db)
	paymentServiceInst := paymentService.NewPaymentService(db, orderRepo, paymentRepo, mayarProvider)
	paymentHandlerInst := paymentHandler.NewPaymentHandler(paymentServiceInst)

	inventoryRepo := inventoryRepository.NewInventoryRepository(db)
	inventoryServiceInst := inventoryService.NewInventoryService(inventoryRepo, productRepo, sellerRepo)
	inventoryHandlerInst := inventoryHandler.NewInventoryHandler(inventoryServiceInst)

	adminRepo := adminRepository.NewDashboardRepository(db)
	adminServiceInst := adminService.NewDashboardService(adminRepo)
	adminHandlerInst := adminHandler.NewDashboardHandler(adminServiceInst)

	app := fiber.New()

	app.Post("/api/auth/register", authHandler.Register)
	app.Post("/api/auth/login", authHandler.Login)
	app.Post("/api/auth/oauth", authHandler.OAuthLogin)
	app.Post("/api/auth/forgot-password", authHandler.ForgotPassword)
	app.Post("/api/auth/reset-password", authHandler.ResetPassword)

	app.Get("/api/me", middleware.JWTAuthMiddleware(), authHandler.Me)
	app.Put("/api/me", middleware.JWTAuthMiddleware(), authHandler.UpdateProfile)

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
	app.Post("/api/seller/products/:id/stock", middleware.JWTAuthMiddleware(), inventoryHandlerInst.AdjustStock)
	app.Get("/api/seller/products/:id/stock-history", middleware.JWTAuthMiddleware(), inventoryHandlerInst.GetStockHistory)
	app.Put("/api/seller/products/:id/price", middleware.JWTAuthMiddleware(), productHandler.UpdatePrice)
	app.Get("/api/seller/low-stock", middleware.JWTAuthMiddleware(), productHandler.GetLowStock)
	app.Get("/api/seller/dashboard", middleware.JWTAuthMiddleware(), sellerHandler.GetDashboard)
	app.Get("/api/seller/dashboard/top-products", middleware.JWTAuthMiddleware(), sellerHandler.GetTopProducts)
	app.Get("/api/seller/dashboard/revenue", middleware.JWTAuthMiddleware(), sellerHandler.GetRevenueAnalytics)
	app.Get("/api/admin/dashboard", middleware.JWTAuthMiddleware(), adminHandlerInst.GetDashboard)

	app.Post("/api/addresses", middleware.JWTAuthMiddleware(), addressHandler.Create)
	app.Get("/api/addresses", middleware.JWTAuthMiddleware(), addressHandler.GetAll)
	app.Get("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.GetByID)
	app.Put("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.Update)
	app.Delete("/api/addresses/:id", middleware.JWTAuthMiddleware(), addressHandler.Delete)

	app.Post("/api/cart/items", middleware.JWTAuthMiddleware(), cartHandler.AddToCart)
	app.Get("/api/cart", middleware.JWTAuthMiddleware(), cartHandler.GetCart)
	app.Put("/api/cart/items/:id", middleware.JWTAuthMiddleware(), cartHandler.UpdateCartItem)
	app.Delete("/api/cart/items/:id", middleware.JWTAuthMiddleware(), cartHandler.DeleteCartItem)

	app.Post("/api/checkout", middleware.JWTAuthMiddleware(), checkoutHandlerInst.Checkout)
	app.Get("/api/orders/:id", middleware.JWTAuthMiddleware(), orderHandlerInst.GetByID)
	app.Get("/api/orders/:id/timeline", middleware.JWTAuthMiddleware(), orderHandlerInst.GetOrderTimeline)
	app.Get("/api/orders", middleware.JWTAuthMiddleware(), orderHandlerInst.GetAll)
	app.Get("/api/admin/orders", middleware.JWTAuthMiddleware(), orderHandlerInst.GetAdminOrders)
	app.Get("/api/seller/orders", middleware.JWTAuthMiddleware(), orderHandlerInst.GetSellerOrders)
	app.Get("/api/seller/orders/:id", middleware.JWTAuthMiddleware(), orderHandlerInst.GetSellerOrderByID)
	app.Put("/api/seller/orders/:id/confirm", middleware.JWTAuthMiddleware(), orderHandlerInst.ConfirmSellerOrder)
	app.Put("/api/seller/orders/:id/pack", middleware.JWTAuthMiddleware(), orderHandlerInst.PackSellerOrder)
	app.Put("/api/seller/orders/:id/deliver", middleware.JWTAuthMiddleware(), orderHandlerInst.DeliverSellerOrder)
	app.Post("/api/orders/:id/pay", middleware.JWTAuthMiddleware(), paymentHandlerInst.Pay)
	app.Get("/api/payments/:id", middleware.JWTAuthMiddleware(), paymentHandlerInst.GetByID)
	app.Post("/api/webhooks/mayar", paymentHandlerInst.HandleMayarWebhook)

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