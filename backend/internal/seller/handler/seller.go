package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/seller/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/service"
	"github.com/gofiber/fiber/v2"
)

type SellerHandler struct {
	service *service.SellerService
}

func NewSellerHandler(service *service.SellerService) *SellerHandler {
	return &SellerHandler{service: service}
}

func (h *SellerHandler) Create(c *fiber.Ctx) error {
	var req dto.CreateSellerRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	seller, err := h.service.Create(req.UserID, req.StoreName, req.Phone, req.Address, req.MarketName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create seller",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.SellerResponse{
		ID:         seller.ID,
		UserID:     seller.UserID,
		StoreName:  seller.StoreName,
		Phone:      seller.Phone,
		Address:    seller.Address,
		MarketName: seller.MarketName,
		IsActive:   seller.IsActive,
		CreatedAt:  seller.CreatedAt.String(),
		UpdatedAt:  seller.UpdatedAt.String(),
	})
}

func (h *SellerHandler) GetAll(c *fiber.Ctx) error {
	sellers, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch sellers",
		})
	}

	var response []dto.SellerResponse
	for _, seller := range sellers {
		response = append(response, dto.SellerResponse{
			ID:         seller.ID,
			UserID:     seller.UserID,
			StoreName:  seller.StoreName,
			Phone:      seller.Phone,
			Address:    seller.Address,
			MarketName: seller.MarketName,
			IsActive:   seller.IsActive,
			CreatedAt:  seller.CreatedAt.String(),
			UpdatedAt:  seller.UpdatedAt.String(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *SellerHandler) GetByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	seller, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Seller not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.SellerResponse{
		ID:         seller.ID,
		UserID:     seller.UserID,
		StoreName:  seller.StoreName,
		Phone:      seller.Phone,
		Address:    seller.Address,
		MarketName: seller.MarketName,
		IsActive:   seller.IsActive,
		CreatedAt:  seller.CreatedAt.String(),
		UpdatedAt:  seller.UpdatedAt.String(),
	})
}

func (h *SellerHandler) Update(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	var req dto.UpdateSellerRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	seller, err := h.service.Update(uint(id), req.StoreName, req.Phone, req.Address, req.MarketName, req.IsActive)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Seller not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.SellerResponse{
		ID:         seller.ID,
		UserID:     seller.UserID,
		StoreName:  seller.StoreName,
		Phone:      seller.Phone,
		Address:    seller.Address,
		MarketName: seller.MarketName,
		IsActive:   seller.IsActive,
		CreatedAt:  seller.CreatedAt.String(),
		UpdatedAt:  seller.UpdatedAt.String(),
	})
}

func (h *SellerHandler) Delete(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	if err := h.service.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Seller not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Seller deleted successfully",
	})
}