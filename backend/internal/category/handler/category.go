package handler

import (
	"github.com/deinsteins/pasarin-web/backend/internal/category/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/category/service"
	"github.com/gofiber/fiber/v2"
)

type CategoryHandler struct {
	service *service.CategoryService
}

func NewCategoryHandler(service *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	var req dto.CreateCategoryRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category, err := h.service.Create(req.Name)
	if err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		Slug:      category.Slug,
		CreatedAt: category.CreatedAt.String(),
		UpdatedAt: category.UpdatedAt.String(),
	})
}

func (h *CategoryHandler) GetAll(c *fiber.Ctx) error {
	categories, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch categories",
		})
	}

	var response []dto.CategoryResponse
	for _, category := range categories {
		response = append(response, dto.CategoryResponse{
			ID:        category.ID,
			Name:      category.Name,
			Slug:      category.Slug,
			CreatedAt: category.CreatedAt.String(),
			UpdatedAt: category.UpdatedAt.String(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *CategoryHandler) GetByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	category, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		Slug:      category.Slug,
		CreatedAt: category.CreatedAt.String(),
		UpdatedAt: category.UpdatedAt.String(),
	})
}

func (h *CategoryHandler) Update(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	var req dto.UpdateCategoryRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category, err := h.service.Update(uint(id), req.Name)
	if err != nil {
		if err.Error() == "category name already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		Slug:      category.Slug,
		CreatedAt: category.CreatedAt.String(),
		UpdatedAt: category.UpdatedAt.String(),
	})
}

func (h *CategoryHandler) Delete(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid category ID",
		})
	}

	if err := h.service.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Category deleted successfully",
	})
}