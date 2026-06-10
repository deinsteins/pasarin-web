package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/cart/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/cart/service"
	"github.com/gofiber/fiber/v2"
)

type CartHandler struct {
	service *service.CartService
}

func NewCartHandler(svc *service.CartService) *CartHandler {
	return &CartHandler{service: svc}
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	var req dto.AddToCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate inputs
	if req.ProductID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "product_id is required"})
	}
	if req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "quantity must be greater than 0"})
	}

	err := h.service.AddToCart(userID, req.ProductID, req.Quantity)
	if err != nil {
		if err.Error() == "product not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err.Error() == "insufficient stock" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add item to cart"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Added to cart",
	})
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	cartRes, err := h.service.GetCart(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve cart"})
	}

	return c.Status(fiber.StatusOK).JSON(cartRes)
}

func (h *CartHandler) UpdateCartItem(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid cart item ID"})
	}

	var req dto.UpdateCartItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate quantity
	if req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "quantity must be greater than 0"})
	}

	err = h.service.UpdateCartItem(userID, uint(id), req.Quantity)
	if err != nil {
		if err.Error() == "cart item not found" || err.Error() == "cart not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
		}
		if err.Error() == "product not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err.Error() == "insufficient stock" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update cart item"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Cart item updated",
	})
}

func (h *CartHandler) DeleteCartItem(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid cart item ID"})
	}

	err = h.service.DeleteCartItem(userID, uint(id))
	if err != nil {
		if err.Error() == "cart item not found" || err.Error() == "cart not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete cart item"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Cart item deleted",
	})
}
