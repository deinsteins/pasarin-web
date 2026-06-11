package repository

import (
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/gorm"
)

type InventoryRepository struct {
	db *database.Database
}

func NewInventoryRepository(db *database.Database) *InventoryRepository {
	return &InventoryRepository{db: db}
}

// AdjustStock updates the product's stock and records an InventoryMovement in a single transaction.
// quantityChange is signed: positive for stock_in, negative for stock_out.
func (r *InventoryRepository) AdjustStock(productID uint, quantityChange int, movementType string, notes string, createdBy uint) (*models.InventoryMovement, error) {
	var movement models.InventoryMovement

	err := r.db.DB().Transaction(func(tx *gorm.DB) error {
		// 1. Lock and fetch product
		var product models.Product
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&product, productID).Error; err != nil {
			return err
		}

		quantityBefore := product.Stock
		quantityAfter := quantityBefore + quantityChange

		// 2. Update product stock
		if err := tx.Model(&product).Update("stock", quantityAfter).Error; err != nil {
			return err
		}

		// 3. Create InventoryMovement record
		movement = models.InventoryMovement{
			ProductID:      productID,
			Type:           movementType,
			QuantityBefore: quantityBefore,
			QuantityChange: quantityChange,
			QuantityAfter:  quantityAfter,
			Notes:          notes,
			CreatedBy:      createdBy,
		}
		if err := tx.Create(&movement).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &movement, nil
}

// GetStockHistory fetches paginated inventory movements for a product, sorted by created_at DESC.
func (r *InventoryRepository) GetStockHistory(productID uint, page, limit int) ([]models.InventoryMovement, int64, error) {
	var movements []models.InventoryMovement
	var total int64

	base := r.db.DB().Model(&models.InventoryMovement{}).Where("product_id = ?", productID)

	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := base.Order("created_at DESC").Limit(limit).Offset(offset).Find(&movements).Error; err != nil {
		return nil, 0, err
	}

	return movements, total, nil
}

