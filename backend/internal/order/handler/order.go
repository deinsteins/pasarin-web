package handler

import (
	"errors"

	"github.com/deinsteins/pasarin-web/backend/internal/order/service"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{service: svc}
}

func (h *OrderHandler) GetByID(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.GetOrderDetail(uint(id), userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve order: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
