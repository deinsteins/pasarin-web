package service

import (
	"errors"

	"github.com/deinsteins/pasarin-web/backend/internal/admin/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/admin/repository"
)

type DashboardService struct {
	repo *repository.DashboardRepository
}

func NewDashboardService(repo *repository.DashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

func (s *DashboardService) GetDashboard(userID uint) (*dto.AdminDashboardResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	if user.Role != "admin" {
		return nil, errors.New("forbidden")
	}

	return s.repo.GetDashboardData()
}
