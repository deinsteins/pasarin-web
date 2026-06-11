package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"os"

	"github.com/deinsteins/pasarin-web/backend/internal/payment/service"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PaymentHandler struct {
	service *service.PaymentService
}

func NewPaymentHandler(svc *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: svc}
}

func (h *PaymentHandler) Pay(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	resp, err := h.service.PayOrder(userID, uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		if err.Error() == "order status must be pending" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create payment: " + err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func (h *PaymentHandler) HandleMayarWebhook(c *fiber.Ctx) error {
	signatureHeader := c.Get("X-Mayar-Signature")
	webhookSecret := os.Getenv("MAYAR_WEBHOOK_SECRET")

	rawBody := c.Body()

	if webhookSecret != "" && signatureHeader != "" {
		if !verifyMayarSignature(rawBody, signatureHeader, webhookSecret) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid webhook signature"})
		}
	}

	var payload struct {
		Event  string `json:"event"`
		Status string `json:"status"`
		ID     string `json:"id"`
		Data   *struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	externalID := payload.ID
	status := payload.Status

	if payload.Data != nil {
		if payload.Data.ID != "" {
			externalID = payload.Data.ID
		}
		if payload.Data.Status != "" {
			status = payload.Data.Status
		}
	}

	if externalID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "external_id not found in payload"})
	}

	err := h.service.ProcessMayarWebhook(externalID, status)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Payment record not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process webhook: " + err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}

func verifyMayarSignature(rawBody []byte, signatureHeader string, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return subtle.ConstantTimeCompare([]byte(signatureHeader), []byte(expectedSignature)) == 1
}
