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

func (r *OrderRepository) UpdateOrderStatus(id uint, status string, changedBy *uint) (*models.Order, error) {
	var order models.Order

	err := r.db.DB().Transaction(func(tx *gorm.DB) error {
		// 1. Fetch current order to capture old status
		if err := tx.First(&order, id).Error; err != nil {
			return err
		}

		fromStatus := order.Status

		// 2. Update status
		order.Status = status
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// 3. Record history
		history := models.OrderStatusHistory{
			OrderID:    id,
			FromStatus: fromStatus,
			ToStatus:   status,
			ChangedBy:  changedBy,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	// Reload with preloads after transaction
	if err := r.db.DB().
		Preload("User").
		Preload("Address").
		Preload("OrderItems").
		First(&order, id).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) GetOrderTimeline(orderID uint, userID uint) ([]models.OrderStatusHistory, error) {
	// Verify ownership — order must belong to userID
	var count int64
	if err := r.db.DB().Model(&models.Order{}).
		Where("id = ? AND user_id = ?", orderID, userID).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	var history []models.OrderStatusHistory
	err := r.db.DB().
		Where("order_id = ?", orderID).
		Order("created_at ASC").
		Find(&history).Error
	if err != nil {
		return nil, err
	}

	return history, nil
}
