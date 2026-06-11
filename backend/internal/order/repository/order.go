package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type OrderRepository struct {
	db *database.Database
}

func NewOrderRepository(db *database.Database) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) GetOrderByIDAndUserID(id uint, userID uint) (*models.Order, []models.OrderItem, error) {
	var order models.Order
	err := r.db.DB().Preload("Address").Where("id = ? AND user_id = ?", id, userID).First(&order).Error
	if err != nil {
		return nil, nil, err
	}

	var items []models.OrderItem
	err = r.db.DB().Where("order_id = ?", order.ID).Find(&items).Error
	if err != nil {
		return nil, nil, err
	}

	return &order, items, nil
}
