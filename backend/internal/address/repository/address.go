package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/gorm"
)

type AddressRepository struct {
	db *database.Database
}

func NewAddressRepository(db *database.Database) *AddressRepository {
	return &AddressRepository{db: db}
}

func (r *AddressRepository) Create(address *models.Address) error {
	return r.db.DB().Transaction(func(tx *gorm.DB) error {
		if address.IsDefault {
			if err := tx.Model(&models.Address{}).Where("user_id = ? AND is_default = ?", address.UserID, true).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Create(address).Error
	})
}

func (r *AddressRepository) FindAllByUserID(userID uint) ([]models.Address, error) {
	var addresses []models.Address
	err := r.db.DB().Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses).Error
	return addresses, err
}

func (r *AddressRepository) FindByIDAndUserID(id uint, userID uint) (*models.Address, error) {
	var address models.Address
	err := r.db.DB().Where("id = ? AND user_id = ?", id, userID).First(&address).Error
	if err != nil {
		return nil, err
	}
	return &address, nil
}

func (r *AddressRepository) Update(address *models.Address) error {
	return r.db.DB().Transaction(func(tx *gorm.DB) error {
		if address.IsDefault {
			if err := tx.Model(&models.Address{}).Where("user_id = ? AND is_default = ?", address.UserID, true).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Save(address).Error
	})
}

func (r *AddressRepository) Delete(id uint, userID uint) error {
	return r.db.DB().Where("id = ? AND user_id = ?", id, userID).Delete(&models.Address{}).Error
}
