package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type SellerRepository struct {
	db *database.Database
}

func NewSellerRepository(db *database.Database) *SellerRepository {
	return &SellerRepository{db: db}
}

func (r *SellerRepository) Create(seller *models.Seller) error {
	return r.db.DB().Create(seller).Error
}

func (r *SellerRepository) FindAll() ([]models.Seller, error) {
	var sellers []models.Seller
	err := r.db.DB().Preload("User").Find(&sellers).Error
	return sellers, err
}

func (r *SellerRepository) FindByID(id uint) (*models.Seller, error) {
	var seller models.Seller
	err := r.db.DB().Preload("User").First(&seller, id).Error
	if err != nil {
		return nil, err
	}
	return &seller, nil
}

func (r *SellerRepository) Update(seller *models.Seller) error {
	return r.db.DB().Save(seller).Error
}

func (r *SellerRepository) Delete(id uint) error {
	return r.db.DB().Delete(&models.Seller{}, id).Error
}

func (r *SellerRepository) FindByUserID(userID uint) (*models.Seller, error) {
	var seller models.Seller
	err := r.db.DB().Where("user_id = ?", userID).First(&seller).Error
	if err != nil {
		return nil, err
	}
	return &seller, nil
}