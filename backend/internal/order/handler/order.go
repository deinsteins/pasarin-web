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

func (h *OrderHandler) GetAll(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	resp, err := h.service.GetOrderHistory(userID, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve order history: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) GetAdminOrders(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	status := c.Query("status", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	resp, err := h.service.GetAdminOrderList(userID, status, page, limit)
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Admin role required."})
		}
		if err.Error() == "user not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve admin order list: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) GetSellerOrders(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	status := c.Query("status", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	resp, err := h.service.GetSellerOrderList(userID, status, page, limit)
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve seller orders: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) GetSellerOrderByID(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.GetSellerOrderDetail(userID, uint(id))
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve seller order detail: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) ConfirmSellerOrder(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.ConfirmSellerOrder(userID, uint(id))
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		if err.Error() == "order status must be paid to confirm" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to confirm order: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) PackSellerOrder(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.PackSellerOrder(userID, uint(id))
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		if err.Error() == "order status must be confirmed to pack" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to pack order: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *OrderHandler) DeliverSellerOrder(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.DeliverSellerOrder(userID, uint(id))
	if err != nil {
		if err.Error() == "unauthorized" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Seller profile required."})
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		if err.Error() == "order status must be packed to deliver" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to deliver order: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
