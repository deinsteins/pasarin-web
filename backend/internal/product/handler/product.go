package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/product/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/product/service"
	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(service *service.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

func (h *ProductHandler) Create(c *fiber.Ctx) error {
	var req dto.CreateProductRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
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

	products, total, err := h.service.GetWithPagination(page, limit, sort)
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
			"error": "Invalid request body",
		})
	}

	product, err := h.service.Update(uint(id), req.CategoryID, req.Name, req.Description, req.Price, req.Stock, req.Unit, req.ImageURL, req.IsActive)
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