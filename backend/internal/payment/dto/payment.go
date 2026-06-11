package dto

type PaymentResponse struct {
	PaymentID  uint   `json:"payment_id"`
	PaymentURL string `json:"payment_url"`
}
