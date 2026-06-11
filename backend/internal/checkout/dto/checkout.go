package dto

type CheckoutRequest struct {
	AddressID uint   `json:"address_id"`
	Notes     string `json:"notes"`
}

type CheckoutResponse struct {
	OrderID     uint   `json:"order_id"`
	OrderNumber string `json:"order_number"`
}
