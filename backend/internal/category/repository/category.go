package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type CategoryRepository struct {
	db *database.Database
}

func NewCategoryRepository(db *database.Database) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.DB().Create(category).Error
}

func (r *CategoryRepository) FindAll() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.DB().Find(&categories).Error
	return categories, err
}

func (r *CategoryRepository) FindByID(id uint) (*models.Category, error) {
	var category models.Category
	err := r.db.DB().First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) FindByName(name string) (*models.Category, error) {
	var category models.Category
	err := r.db.DB().Where("name = ?", name).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) Update(category *models.Category) error {
	return r.db.DB().Save(category).Error
}

func (r *CategoryRepository) Delete(id uint) error {
	return r.db.DB().Delete(&models.Category{}, id).Error
}

func (r *CategoryRepository) IsDuplicateName(name string, excludeID uint) bool {
	var count int64
	query := r.db.DB().Model(&models.Category{}).Where("name = ?", name)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	query.Count(&count)
	return count > 0
}