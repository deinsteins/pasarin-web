package dto

type CreateAddressRequest struct {
	Label          string `json:"label"`
	RecipientName  string `json:"recipient_name"`
	RecipientPhone string `json:"recipient_phone"`
	Province       string `json:"province"`
	City           string `json:"city"`
	District       string `json:"district"`
	PostalCode     string `json:"postal_code"`
	Address        string `json:"address"`
	IsDefault      bool   `json:"is_default"`
}

type UpdateAddressRequest struct {
	Label          *string `json:"label"`
	RecipientName  *string `json:"recipient_name"`
	RecipientPhone *string `json:"recipient_phone"`
	Province       *string `json:"province"`
	City           *string `json:"city"`
	District       *string `json:"district"`
	PostalCode     *string `json:"postal_code"`
	Address        *string `json:"address"`
	IsDefault      *bool   `json:"is_default"`
}

type AddressResponse struct {
	ID             uint   `json:"id"`
	UserID         uint   `json:"user_id"`
	Label          string `json:"label"`
	RecipientName  string `json:"recipient_name"`
	RecipientPhone string `json:"recipient_phone"`
	Province       string `json:"province"`
	City           string `json:"city"`
	District       string `json:"district"`
	PostalCode     string `json:"postal_code"`
	Address        string `json:"address"`
	IsDefault      bool   `json:"is_default"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}
