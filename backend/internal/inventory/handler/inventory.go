package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/inventory/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/inventory/service"
	"github.com/gofiber/fiber/v2"
)

type InventoryHandler struct {
	service *service.InventoryService
}

func NewInventoryHandler(svc *service.InventoryService) *InventoryHandler {
	return &InventoryHandler{service: svc}
}

func (h *InventoryHandler) AdjustStock(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	productID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	var req dto.StockAdjustmentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.service.AdjustStock(userID, uint(productID), req)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		case "forbidden":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You do not own this product."})
		case "product not found":
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
		case "invalid type: must be stock_in, stock_out, or adjustment":
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		case "quantity must be greater than zero":
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to adjust stock: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *InventoryHandler) GetStockHistory(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	productID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	resp, err := h.service.GetStockHistory(userID, uint(productID), page, limit)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		case "forbidden":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You do not own this product."})
		case "product not found":
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get stock history: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

