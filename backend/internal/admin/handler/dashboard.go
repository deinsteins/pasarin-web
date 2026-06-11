package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/admin/service"
	"github.com/gofiber/fiber/v2"
)

type DashboardHandler struct {
	service *service.DashboardService
}

func NewDashboardHandler(svc *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: svc}
}

func (h *DashboardHandler) GetDashboard(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	resp, err := h.service.GetDashboard(userID)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		case "forbidden":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Admin role required."})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get admin dashboard: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
