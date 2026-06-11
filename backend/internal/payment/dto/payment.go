package dto

type PaymentResponse struct {
	PaymentID  uint   `json:"payment_id"`
	PaymentURL string `json:"payment_url"`
}

type PaymentDetailResponse struct {
	ID         uint    `json:"id"`
	Amount     float64 `json:"amount"`
	Status     string  `json:"status"`
	PaymentURL string  `json:"payment_url"`
	ExternalID string  `json:"external_id"`
}
