package repository

import (
	"time"

	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/dto"
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

func (r *SellerRepository) GetDashboardData(sellerID uint) (*dto.SellerDashboardResponse, error) {
	var totalProducts int64
	if err := r.db.DB().Model(&models.Product{}).Where("seller_id = ?", sellerID).Count(&totalProducts).Error; err != nil {
		return nil, err
	}

	var totalOrders int64
	if err := r.db.DB().Model(&models.OrderItem{}).
		Where("seller_id = ?", sellerID).
		Distinct("order_id").
		Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	var todayOrders int64
	if err := r.db.DB().Table("order_items").
		Select("COUNT(DISTINCT order_items.order_id)").
		Joins("JOIN orders ON order_items.order_id = orders.id").
		Where("order_items.seller_id = ? AND orders.created_at >= ?", sellerID, startOfToday).
		Row().Scan(&todayOrders); err != nil {
		return nil, err
	}

	var todayRevenue float64
	if err := r.db.DB().Table("order_items").
		Select("COALESCE(SUM(order_items.subtotal), 0)").
		Joins("JOIN orders ON order_items.order_id = orders.id").
		Where("order_items.seller_id = ? AND orders.status IN ('paid', 'confirmed', 'packed', 'delivered') AND orders.created_at >= ?", sellerID, startOfToday).
		Row().Scan(&todayRevenue); err != nil {
		return nil, err
	}

	var monthlyRevenue float64
	if err := r.db.DB().Table("order_items").
		Select("COALESCE(SUM(order_items.subtotal), 0)").
		Joins("JOIN orders ON order_items.order_id = orders.id").
		Where("order_items.seller_id = ? AND orders.status IN ('paid', 'confirmed', 'packed', 'delivered') AND orders.created_at >= ?", sellerID, startOfMonth).
		Row().Scan(&monthlyRevenue); err != nil {
		return nil, err
	}

	var lowStockCount int64
	if err := r.db.DB().Model(&models.Product{}).
		Where("seller_id = ? AND stock <= 5", sellerID).
		Count(&lowStockCount).Error; err != nil {
		return nil, err
	}

	return &dto.SellerDashboardResponse{
		TotalProducts:  totalProducts,
		TotalOrders:    totalOrders,
		TodayOrders:    todayOrders,
		TodayRevenue:   todayRevenue,
		MonthlyRevenue: monthlyRevenue,
		LowStockCount:  lowStockCount,
	}, nil
}

func (r *SellerRepository) GetTopProducts(sellerID uint) ([]dto.TopProductResponse, error) {
	var topProducts []dto.TopProductResponse

	err := r.db.DB().Table("order_items").
		Select("order_items.product_id, order_items.product_name, SUM(order_items.quantity) as sold_quantity, SUM(order_items.subtotal) as total_revenue").
		Joins("JOIN orders ON order_items.order_id = orders.id").
		Where("order_items.seller_id = ? AND orders.status IN ('paid', 'confirmed', 'packed', 'delivered')", sellerID).
		Group("order_items.product_id, order_items.product_name").
		Order("sold_quantity DESC").
		Limit(10).
		Scan(&topProducts).Error

	if err != nil {
		return nil, err
	}

	return topProducts, nil
}