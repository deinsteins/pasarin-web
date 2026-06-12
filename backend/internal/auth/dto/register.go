package dto

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required,min=10,max=15"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterResponse struct {
	Message string `json:"message"`
}
