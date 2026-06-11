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

func (r *OrderRepository) GetOrderByIDAndUserID(id uint, userID uint) (*models.Order, error) {
	var order models.Order
	err := r.db.DB().
		Preload("User").
		Preload("Address").
		Preload("OrderItems").
		Where("id = ? AND user_id = ?", id, userID).
		First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) FindAllByUserID(userID uint, page int, limit int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db.DB().Model(&models.Order{}).Where("user_id = ?", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.
		Preload("Address").
		Preload("OrderItems").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error

	return orders, total, err
}

func (r *OrderRepository) GetAdminOrders(status string, page int, limit int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db.DB().Model(&models.Order{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.
		Preload("User").
		Preload("Address").
		Preload("OrderItems").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error

	return orders, total, err
}

func (r *OrderRepository) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	err := r.db.DB().First(&user, userID).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
