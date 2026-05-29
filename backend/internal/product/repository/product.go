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

func (r *ProductRepository) FindWithPagination(page, limit int, sort string) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	r.db.DB().Model(&models.Product{}).Count(&total)

	offset := (page - 1) * limit

	query := r.db.DB().Preload("Seller").Preload("Category")

	switch sort {
	case "latest":
		query = query.Order("created_at DESC")
	case "oldest":
		query = query.Order("created_at ASC")
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "name":
		query = query.Order("name ASC")
	default:
		query = query.Order("created_at DESC")
	}

	err := query.Offset(offset).Limit(limit).Find(&products).Error
	return products, total, err
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