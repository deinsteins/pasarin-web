package dto

type AddToCartRequest struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity"`
}

type CartResponse struct {
	Items []CartItemResponse `json:"items"`
	Total float64            `json:"total"`
}

type CartItemResponse struct {
	ID        uint            `json:"id"`
	ProductID uint            `json:"product_id"`
	Quantity  int             `json:"quantity"`
	Subtotal  float64         `json:"subtotal"`
	Product   ProductResponse `json:"product"`
}

type ProductResponse struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Stock       int            `json:"stock"`
	IsAvailable bool           `json:"is_available"`
	Unit        string         `json:"unit"`
	ImageURL    string         `json:"image_url"`
	IsActive    bool           `json:"is_active"`
	Seller      SellerResponse `json:"seller"`
}

type SellerResponse struct {
	ID        uint   `json:"id"`
	StoreName string `json:"store_name"`
}
