package database

import (
	"fmt"
	"log"
	"os"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database struct {
	db *gorm.DB
}

func (d *Database) DB() *gorm.DB {
	return d.db
}

func Connect() (*Database, error) {

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Seller{}, &models.Category{}, &models.Product{}, &models.Address{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{}); err != nil {
		log.Fatal("failed to migrate database: ", err)
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return &Database{db: db}, nil
}