package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
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
