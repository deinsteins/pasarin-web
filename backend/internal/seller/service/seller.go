package service

import (
	"errors"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
)

type SellerService struct {
	repo *repository.SellerRepository
}

func NewSellerService(repo *repository.SellerRepository) *SellerService {
	return &SellerService{repo: repo}
}

func (s *SellerService) Create(userID uint, storeName, phone, address, marketName string) (*models.Seller, error) {
	seller := &models.Seller{
		UserID:     userID,
		StoreName:  storeName,
		Phone:      phone,
		Address:    address,
		MarketName: marketName,
		IsActive:   true,
	}

	if err := s.repo.Create(seller); err != nil {
		return nil, err
	}

	return seller, nil
}

func (s *SellerService) GetAll() ([]models.Seller, error) {
	return s.repo.FindAll()
}

func (s *SellerService) GetByID(id uint) (*models.Seller, error) {
	return s.repo.FindByID(id)
}

func (s *SellerService) Update(id uint, storeName, phone, address, marketName string, isActive *bool) (*models.Seller, error) {
	seller, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	seller.StoreName = storeName
	seller.Phone = phone
	seller.Address = address
	seller.MarketName = marketName

	if isActive != nil {
		seller.IsActive = *isActive
	}

	if err := s.repo.Update(seller); err != nil {
		return nil, err
	}

	return seller, nil
}

func (s *SellerService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(id)
}

func (s *SellerService) GetDashboard(userID uint) (*dto.SellerDashboardResponse, error) {
	seller, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	return s.repo.GetDashboardData(seller.ID)
}