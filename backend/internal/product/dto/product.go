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
	CategoryID  *uint    `json:"category_id"`
	Name        *string  `json:"name"`
	Description string   `json:"description"`
	Price       *float64 `json:"price"`
	Stock       *int     `json:"stock"`
	Unit        *string  `json:"unit"`
	ImageURL    string   `json:"image_url"`
	IsActive    *bool    `json:"is_active"`
}

type ProductResponse struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Stock       int            `json:"stock"`
	Unit        string         `json:"unit"`
	ImageURL    string         `json:"image_url"`
	IsActive    bool           `json:"is_active"`
	CreatedAt   string         `json:"created_at"`
	UpdatedAt   string         `json:"updated_at"`
	Seller      SellerResponse `json:"seller"`
	Category    CategoryResponse `json:"category"`
}

type SellerResponse struct {
	ID        uint   `json:"id"`
	StoreName string `json:"store_name"`
}

type CategoryResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type PaginationMeta struct {
	Page     int   `json:"page"`
	Limit    int   `json:"limit"`
	Total    int64 `json:"total"`
	LastPage int64 `json:"last_page"`
}

type PaginatedProductResponse struct {
	Data []ProductResponse `json:"data"`
	Meta PaginationMeta    `json:"meta"`
}