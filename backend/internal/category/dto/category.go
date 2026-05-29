package dto

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required,min=1,max=100"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" binding:"required,min=1,max=100"`
}

type CategoryResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}