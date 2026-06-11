package payment

import (
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type PaymentLinkResponse struct {
	ExternalID string  `json:"external_id"`
	PaymentURL string  `json:"payment_url"`
	Amount     float64 `json:"amount"`
	Status     string  `json:"status"`
}

type PaymentProvider interface {
	CreatePaymentLink(order models.Order) (PaymentLinkResponse, error)
}
