package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/gorm"
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
		Preload("Payments").
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

func (r *OrderRepository) FindAllBySellerID(sellerID uint, status string, page int, limit int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	subQuery := r.db.DB().Model(&models.OrderItem{}).
		Select("order_id").
		Where("seller_id = ?", sellerID)

	query := r.db.DB().Model(&models.Order{}).Where("id IN (?)", subQuery)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.
		Preload("User").
		Preload("OrderItems", "seller_id = ?", sellerID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error

	return orders, total, err
}

func (r *OrderRepository) GetOrderByIDAndSellerID(id uint, sellerID uint) (*models.Order, error) {
	var order models.Order

	// Check if this order contains any items owned by the seller
	var count int64
	err := r.db.DB().Model(&models.OrderItem{}).
		Where("order_id = ? AND seller_id = ?", id, sellerID).
		Count(&count).Error
	if err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	// Load the complete order preloading User (as customer), Address, and only this seller's OrderItems!
	err = r.db.DB().
		Preload("User").
		Preload("Address").
		Preload("OrderItems", "seller_id = ?", sellerID).
		First(&order, id).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) UpdateOrderStatus(id uint, status string) (*models.Order, error) {
	var order models.Order
	if err := r.db.DB().First(&order, id).Error; err != nil {
		return nil, err
	}

	order.Status = status
	if err := r.db.DB().Save(&order).Error; err != nil {
		return nil, err
	}

	// Reload with preloads
	err := r.db.DB().
		Preload("User").
		Preload("Address").
		Preload("OrderItems").
		First(&order, id).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}
