package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *database.Database
}

func NewPaymentRepository(db *database.Database) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) CreatePayment(payment *models.Payment) error {
	return r.db.DB().Create(payment).Error
}

func (r *PaymentRepository) GetPaymentByIDAndUserID(id uint, userID uint) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.DB().Preload("Order").Where("id = ?", id).First(&payment).Error
	if err != nil {
		return nil, err
	}
	if payment.Order.UserID != userID {
		return nil, gorm.ErrRecordNotFound
	}
	return &payment, nil
}
