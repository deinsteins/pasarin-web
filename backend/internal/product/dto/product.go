package dto

type CreateProductRequest struct {
	SellerID    uint    `json:"seller_id" binding:"required"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Name        string  `json:"name" binding:"required,min=1,max=100"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"gte=0"`
	Unit        string  `json:"unit" binding:"required"`
	ImageURL    string  `json:"image_url"`
}

type UpdateProductRequest struct {
	CategoryID  uint    `json:"category_id" binding:"required"`
	Name        string  `json:"name" binding:"required,min=1,max=100"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"gte=0"`
	Unit        string  `json:"unit" binding:"required"`
	ImageURL    string  `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

type ProductResponse struct {
	ID          uint    `json:"id"`
	SellerID    uint    `json:"seller_id"`
	CategoryID  uint    `json:"category_id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Unit        string  `json:"unit"`
	ImageURL    string  `json:"image_url"`
	IsActive    bool    `json:"is_active"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}