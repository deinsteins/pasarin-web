package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/joho/godotenv"

	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatal(err)
	}

	categories := []string{
		"Sayuran",
		"Buah",
		"Bumbu",
		"Daging",
		"Ayam",
		"Ikan",
		"Telur",
		"Sembako",
	}

	for _, name := range categories {
		slug := generateSlug(name)

		var count int64
		db.DB().Model(&models.Category{}).Where("slug = ?", slug).Count(&count)

		if count > 0 {
			fmt.Printf("Category '%s' already exists, skipping\n", name)
			continue
		}

		category := &models.Category{
			Name: name,
			Slug: slug,
		}

		if err := db.DB().Create(category).Error; err != nil {
			log.Printf("Failed to create category '%s': %v\n", name, err)
			continue
		}

		fmt.Printf("Created category: %s\n", name)
	}

	fmt.Println("Seeding completed!")
}

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}