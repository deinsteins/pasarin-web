package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/checkout/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/checkout/service"
	"github.com/gofiber/fiber/v2"
)

type CheckoutHandler struct {
	service *service.CheckoutService
}

func NewCheckoutHandler(svc *service.CheckoutService) *CheckoutHandler {
	return &CheckoutHandler{service: svc}
}

func (h *CheckoutHandler) Checkout(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	var req dto.CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.AddressID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "address_id is required"})
	}

	resp, err := h.service.Checkout(userID, req)
	if err != nil {
		if err.Error() == "cart is empty" || err.Error() == "address not found or unauthorized" || err.Error() == "invalid quantity in cart" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		// Check for stock errors
		if len(err.Error()) >= 18 && err.Error()[:18] == "insufficient stock" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to complete checkout: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
