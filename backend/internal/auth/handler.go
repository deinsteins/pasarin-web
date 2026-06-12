package auth

import (
	"github.com/deinsteins/pasarin-web/backend/internal/auth/dto"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authService *AuthService
}

func NewAuthHandler(authService *AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.authService.Register(req.Name, req.Email, req.Password, req.Phone); err != nil {
		if err.Error() == "email already exists" || err.Error() == "phone number already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Registration failed: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.RegisterResponse{
		Message: "User registered successfully",
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.LoginResponse{
		Token: token,
	})
}

type OAuthRequest struct {
	Email string `json:"email" binding:"required,email"`
	Name  string `json:"name" binding:"required"`
}

func (h *AuthHandler) OAuthLogin(c *fiber.Ctx) error {
	var req OAuthRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	token, err := h.authService.LoginOAuth(req.Email, req.Name)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "OAuth login failed: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.LoginResponse{
		Token: token,
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	user, err := h.authService.GetUserByID(userID.(uint))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
		Role:  user.Role,
	})
}

type UpdateProfileRequest struct {
	Name     string `json:"name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password"`
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.authService.UpdateProfile(userID.(uint), req.Name, req.Phone, req.Password); err != nil {
		if err.Error() == "phone number already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update profile: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Profile updated successfully",
	})
}
