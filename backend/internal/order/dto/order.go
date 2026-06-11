package dto

type OrderDetailResponse struct {
	ID          uint                 `json:"id"`
	OrderNumber string               `json:"order_number"`
	UserID      uint                 `json:"user_id"`
	Status      string               `json:"status"`
	Subtotal    float64              `json:"subtotal"`
	DeliveryFee float64              `json:"delivery_fee"`
	TotalAmount float64              `json:"total_amount"`
	Notes       string               `json:"notes"`
	CreatedAt   string               `json:"created_at"`
	UpdatedAt   string               `json:"updated_at"`
	Address     AddressResponse      `json:"address"`
	Items       []OrderItemResponse  `json:"items"`
	Payment     *PaymentInfoResponse `json:"payment,omitempty"`
}

type AddressResponse struct {
	ID             uint   `json:"id"`
	Label          string `json:"label"`
	RecipientName  string `json:"recipient_name"`
	RecipientPhone string `json:"recipient_phone"`
	Province       string `json:"province"`
	City           string `json:"city"`
	District       string `json:"district"`
	PostalCode     string `json:"postal_code"`
	Address        string `json:"address"`
}

type OrderItemResponse struct {
	ID           uint    `json:"id"`
	ProductID    uint    `json:"product_id"`
	SellerID     uint    `json:"seller_id"`
	ProductName  string  `json:"product_name"`
	ProductPrice float64 `json:"product_price"`
	Quantity     int     `json:"quantity"`
	Subtotal     float64 `json:"subtotal"`
}

type PaymentInfoResponse struct {
	Status     string `json:"status"`
	PaymentURL string `json:"payment_url"`
}

type PaginationMeta struct {
	Page     int   `json:"page"`
	Limit    int   `json:"limit"`
	Total    int64 `json:"total"`
	LastPage int64 `json:"last_page"`
}

type PaginatedOrderResponse struct {
	Data []OrderDetailResponse `json:"data"`
	Meta PaginationMeta        `json:"meta"`
}

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type AdminOrderResponse struct {
	ID          uint                `json:"id"`
	OrderNumber string              `json:"order_number"`
	UserID      uint                `json:"user_id"`
	Status      string              `json:"status"`
	Subtotal    float64             `json:"subtotal"`
	DeliveryFee float64             `json:"delivery_fee"`
	TotalAmount float64             `json:"total_amount"`
	Notes       string              `json:"notes"`
	CreatedAt   string              `json:"created_at"`
	UpdatedAt   string              `json:"updated_at"`
	User        UserResponse        `json:"user"`
	Address     AddressResponse     `json:"address"`
	Items       []OrderItemResponse `json:"items,omitempty"`
}

type PaginatedAdminOrderResponse struct {
	Data []AdminOrderResponse `json:"data"`
	Meta PaginationMeta       `json:"meta"`
}
