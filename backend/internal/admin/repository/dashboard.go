package repository

import (
	"time"

	"github.com/deinsteins/pasarin-web/backend/internal/admin/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/database"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type DashboardRepository struct {
	db *database.Database
}

func NewDashboardRepository(db *database.Database) *DashboardRepository {
	return &DashboardRepository{db: db}
}

func (r *DashboardRepository) GetDashboardData() (*dto.AdminDashboardResponse, error) {
	var totalSellers int64
	if err := r.db.DB().Model(&models.Seller{}).Count(&totalSellers).Error; err != nil {
		return nil, err
	}

	var totalCustomers int64
	if err := r.db.DB().Model(&models.User{}).Where("role = ?", "customer").Count(&totalCustomers).Error; err != nil {
		return nil, err
	}

	var totalProducts int64
	if err := r.db.DB().Model(&models.Product{}).Count(&totalProducts).Error; err != nil {
		return nil, err
	}

	var totalOrders int64
	if err := r.db.DB().Model(&models.Order{}).Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	var todayOrders int64
	if err := r.db.DB().Model(&models.Order{}).Where("created_at >= ?", startOfToday).Count(&todayOrders).Error; err != nil {
		return nil, err
	}

	var todayRevenue float64
	if err := r.db.DB().Model(&models.Order{}).
		Select("COALESCE(SUM(total_amount), 0)").
		Where("status IN ('paid', 'confirmed', 'packed', 'delivered') AND created_at >= ?", startOfToday).
		Row().Scan(&todayRevenue); err != nil {
		return nil, err
	}

	var monthlyRevenue float64
	if err := r.db.DB().Model(&models.Order{}).
		Select("COALESCE(SUM(total_amount), 0)").
		Where("status IN ('paid', 'confirmed', 'packed', 'delivered') AND created_at >= ?", startOfMonth).
		Row().Scan(&monthlyRevenue); err != nil {
		return nil, err
	}

	return &dto.AdminDashboardResponse{
		TotalSellers:   totalSellers,
		TotalCustomers: totalCustomers,
		TotalProducts:  totalProducts,
		TotalOrders:    totalOrders,
		TodayOrders:    todayOrders,
		TodayRevenue:   todayRevenue,
		MonthlyRevenue: monthlyRevenue,
	}, nil
}

func (r *DashboardRepository) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	if err := r.db.DB().First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

