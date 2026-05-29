package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type ProductRepository struct {
	db *database.Database
}

func NewProductRepository(db *database.Database) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *models.Product) error {
	return r.db.DB().Create(product).Error
}

func (r *ProductRepository) FindAll() ([]models.Product, error) {
	var products []models.Product
	err := r.db.DB().Preload("Seller").Preload("Category").Find(&products).Error
	return products, err
}

func (r *ProductRepository) FindByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.DB().Preload("Seller").Preload("Category").First(&product, id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Update(product *models.Product) error {
	return r.db.DB().Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.DB().Delete(&models.Product{}, id).Error
}