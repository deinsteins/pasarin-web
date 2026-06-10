package handler

import (
	"errors"
	"github.com/deinsteins/pasarin-web/backend/internal/address/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/address/service"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AddressHandler struct {
	service *service.AddressService
}

func NewAddressHandler(svc *service.AddressService) *AddressHandler {
	return &AddressHandler{service: svc}
}

func (h *AddressHandler) Create(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	var req dto.CreateAddressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Manual validation
	if req.Label == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "label is required"})
	}
	if req.RecipientName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "recipient_name is required"})
	}
	if req.RecipientPhone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "recipient_phone is required"})
	}
	if req.Province == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "province is required"})
	}
	if req.City == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "city is required"})
	}
	if req.District == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "district is required"})
	}
	if req.PostalCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "postal_code is required"})
	}
	if req.Address == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "address is required"})
	}

	address, err := h.service.Create(userID, req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create address"})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.AddressResponse{
		ID:             address.ID,
		UserID:         address.UserID,
		Label:          address.Label,
		RecipientName:  address.RecipientName,
		RecipientPhone: address.RecipientPhone,
		Province:       address.Province,
		City:           address.City,
		District:       address.District,
		PostalCode:     address.PostalCode,
		Address:        address.Address,
		IsDefault:      address.IsDefault,
		CreatedAt:      address.CreatedAt.String(),
		UpdatedAt:      address.UpdatedAt.String(),
	})
}

func (h *AddressHandler) GetAll(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	addresses, err := h.service.GetAll(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch addresses"})
	}

	var response []dto.AddressResponse = []dto.AddressResponse{}
	for _, address := range addresses {
		response = append(response, dto.AddressResponse{
			ID:             address.ID,
			UserID:         address.UserID,
			Label:          address.Label,
			RecipientName:  address.RecipientName,
			RecipientPhone: address.RecipientPhone,
			Province:       address.Province,
			City:           address.City,
			District:       address.District,
			PostalCode:     address.PostalCode,
			Address:        address.Address,
			IsDefault:      address.IsDefault,
			CreatedAt:      address.CreatedAt.String(),
			UpdatedAt:      address.UpdatedAt.String(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *AddressHandler) GetByID(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid address ID"})
	}

	address, err := h.service.GetByID(uint(id), userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Address not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch address"})
	}

	return c.Status(fiber.StatusOK).JSON(dto.AddressResponse{
		ID:             address.ID,
		UserID:         address.UserID,
		Label:          address.Label,
		RecipientName:  address.RecipientName,
		RecipientPhone: address.RecipientPhone,
		Province:       address.Province,
		City:           address.City,
		District:       address.District,
		PostalCode:     address.PostalCode,
		Address:        address.Address,
		IsDefault:      address.IsDefault,
		CreatedAt:      address.CreatedAt.String(),
		UpdatedAt:      address.UpdatedAt.String(),
	})
}

func (h *AddressHandler) Update(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid address ID"})
	}

	var req dto.UpdateAddressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Manual validation for updates if they are provided as non-empty or non-nil
	if req.Label != nil && *req.Label == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "label cannot be empty"})
	}
	if req.RecipientName != nil && *req.RecipientName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "recipient_name cannot be empty"})
	}
	if req.RecipientPhone != nil && *req.RecipientPhone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "recipient_phone cannot be empty"})
	}
	if req.Province != nil && *req.Province == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "province cannot be empty"})
	}
	if req.City != nil && *req.City == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "city cannot be empty"})
	}
	if req.District != nil && *req.District == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "district cannot be empty"})
	}
	if req.PostalCode != nil && *req.PostalCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "postal_code cannot be empty"})
	}
	if req.Address != nil && *req.Address == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "address cannot be empty"})
	}

	address, err := h.service.Update(uint(id), userID, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Address not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update address"})
	}

	return c.Status(fiber.StatusOK).JSON(dto.AddressResponse{
		ID:             address.ID,
		UserID:         address.UserID,
		Label:          address.Label,
		RecipientName:  address.RecipientName,
		RecipientPhone: address.RecipientPhone,
		Province:       address.Province,
		City:           address.City,
		District:       address.District,
		PostalCode:     address.PostalCode,
		Address:        address.Address,
		IsDefault:      address.IsDefault,
		CreatedAt:      address.CreatedAt.String(),
		UpdatedAt:      address.UpdatedAt.String(),
	})
}

func (h *AddressHandler) Delete(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := userIDVal.(uint)

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid address ID"})
	}

	err = h.service.Delete(uint(id), userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Address not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete address"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Address deleted successfully",
	})
}
