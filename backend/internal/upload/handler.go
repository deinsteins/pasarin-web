package upload

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

const maxFileSize = 5 * 1024 * 1024 // 5MB

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

type UploadHandler struct {
	service *UploadService
}

func NewUploadHandler(service *UploadService) *UploadHandler {
	return &UploadHandler{service: service}
}

func (h *UploadHandler) Upload(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File is required (field: file)",
		})
	}

	// Validate size
	if fileHeader.Size > maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File size exceeds 5MB limit",
		})
	}

	// Validate type by extension
	ext := strings.ToLower(fileHeader.Filename[strings.LastIndex(fileHeader.Filename, "."):])
	if !allowedExtensions[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Only image files are allowed: jpg, jpeg, png, webp",
		})
	}

	// Validate folder param
	folder := c.FormValue("folder", "products")
	if !AllowedFolders[folder] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid folder. Allowed: products, stores, categories, banners, avatars",
		})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "Failed to read file",
			"detail": err.Error(),
		})
	}
	defer file.Close()

	result, err := h.service.UploadFile(file, fileHeader.Filename, folder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "Failed to upload file",
			"detail": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"key": result.Key,
		"url": result.URL,
	})
}
