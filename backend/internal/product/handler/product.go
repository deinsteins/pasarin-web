package handler

import (
	"net/url"
	"strings"

	"github.com/deinsteins/pasarin-web/backend/internal/product/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/product/service"
	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(svc *service.ProductService) *ProductHandler {
	return &ProductHandler{service: svc}
}

func isValidImageURL(rawURL string) bool {
	if rawURL == "" {
		return true // optional
	}
	u, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return false
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return false
	}
	if u.Host == "" {
		return false
	}
	ext := strings.ToLower(u.Path)
	for _, valid := range []string{".jpg", ".jpeg", ".png", ".webp", ".gif"} {
		if strings.HasSuffix(ext, valid) {
			return true
		}
	}
	return false
}

func (h *ProductHandler) Create(c *fiber.Ctx) error {
	var req dto.CreateProductRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.SellerID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "seller_id is required"})
	}
	if req.CategoryID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "category_id is required"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name is required"})
	}
	if req.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "price must be greater than 0"})
	}
	if req.Stock < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "stock must be >= 0"})
	}
	if req.Unit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "unit is required"})
	}
	if !isValidImageURL(req.ImageURL) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "image_url must be a valid http/https URL ending in .jpg, .jpeg, .png, .webp, or .gif",
		})
	}

	product, err := h.service.Create(req.SellerID, req.CategoryID, req.Name, req.Description, req.Price, req.Stock, req.Unit, req.ImageURL)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create product",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Slug:        product.Slug,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		Unit:        product.Unit,
		ImageURL:    product.ImageURL,
		IsActive:    product.IsActive,
		CreatedAt:   product.CreatedAt.String(),
		UpdatedAt:   product.UpdatedAt.String(),
		Seller: dto.SellerResponse{
			ID:        product.Seller.ID,
			StoreName: product.Seller.StoreName,
		},
		Category: dto.CategoryResponse{
			ID:   product.Category.ID,
			Name: product.Category.Name,
		},
	})
}

func (h *ProductHandler) GetAll(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	sort := c.Query("sort", "latest")
	search := strings.TrimSpace(c.Query("search", ""))

	products, total, err := h.service.GetWithPagination(page, limit, sort, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch products",
		})
	}

	var data []dto.ProductResponse
	for _, product := range products {
		data = append(data, dto.ProductResponse{
			ID:          product.ID,
			Name:        product.Name,
			Slug:        product.Slug,
			Description: product.Description,
			Price:       product.Price,
			Stock:       product.Stock,
			Unit:        product.Unit,
			ImageURL:    product.ImageURL,
			IsActive:    product.IsActive,
			CreatedAt:   product.CreatedAt.String(),
			UpdatedAt:   product.UpdatedAt.String(),
			Seller: dto.SellerResponse{
				ID:        product.Seller.ID,
				StoreName: product.Seller.StoreName,
			},
			Category: dto.CategoryResponse{
				ID:   product.Category.ID,
				Name: product.Category.Name,
			},
		})
	}

	totalPages := total / int64(limit)
	if total%int64(limit) != 0 {
		totalPages++
	}

	return c.Status(fiber.StatusOK).JSON(dto.PaginatedProductResponse{
		Data: data,
		Meta: dto.PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

func (h *ProductHandler) GetByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid product ID",
		})
	}

	product, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Slug:        product.Slug,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		Unit:        product.Unit,
		ImageURL:    product.ImageURL,
		IsActive:    product.IsActive,
		CreatedAt:   product.CreatedAt.String(),
		UpdatedAt:   product.UpdatedAt.String(),
		Seller: dto.SellerResponse{
			ID:        product.Seller.ID,
			StoreName: product.Seller.StoreName,
		},
		Category: dto.CategoryResponse{
			ID:   product.Category.ID,
			Name: product.Category.Name,
		},
	})
}

func (h *ProductHandler) Update(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid product ID",
		})
	}

	var req dto.UpdateProductRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":  "Invalid request body",
			"detail": err.Error(),
		})
	}

	if !isValidImageURL(req.ImageURL) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "image_url must be a valid http/https URL ending in .jpg, .jpeg, .png, .webp, or .gif",
		})
	}

	product, err := h.service.UpdatePartial(uint(id), req.CategoryID, req.Name, req.Description, req.Price, req.Stock, req.Unit, req.ImageURL, req.IsActive)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Slug:        product.Slug,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		Unit:        product.Unit,
		ImageURL:    product.ImageURL,
		IsActive:    product.IsActive,
		CreatedAt:   product.CreatedAt.String(),
		UpdatedAt:   product.UpdatedAt.String(),
		Seller: dto.SellerResponse{
			ID:        product.Seller.ID,
			StoreName: product.Seller.StoreName,
		},
		Category: dto.CategoryResponse{
			ID:   product.Category.ID,
			Name: product.Category.Name,
		},
	})
}

func (h *ProductHandler) Delete(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid product ID",
		})
	}

	if err := h.service.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Product deleted successfully",
	})
}
