package service

import (
	"github.com/deinsteins/pasarin-web/backend/internal/address/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/address/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type AddressService struct {
	repo *repository.AddressRepository
}

func NewAddressService(repo *repository.AddressRepository) *AddressService {
	return &AddressService{repo: repo}
}

func (s *AddressService) Create(userID uint, req dto.CreateAddressRequest) (*models.Address, error) {
	address := &models.Address{
		UserID:         userID,
		Label:          req.Label,
		RecipientName:  req.RecipientName,
		RecipientPhone: req.RecipientPhone,
		Province:       req.Province,
		City:           req.City,
		District:       req.District,
		PostalCode:     req.PostalCode,
		Address:        req.Address,
		IsDefault:      req.IsDefault,
	}

	if err := s.repo.Create(address); err != nil {
		return nil, err
	}
	return address, nil
}

func (s *AddressService) GetAll(userID uint) ([]models.Address, error) {
	return s.repo.FindAllByUserID(userID)
}

func (s *AddressService) GetByID(id uint, userID uint) (*models.Address, error) {
	return s.repo.FindByIDAndUserID(id, userID)
}

func (s *AddressService) Update(id uint, userID uint, req dto.UpdateAddressRequest) (*models.Address, error) {
	address, err := s.repo.FindByIDAndUserID(id, userID)
	if err != nil {
		return nil, err
	}

	if req.Label != nil {
		address.Label = *req.Label
	}
	if req.RecipientName != nil {
		address.RecipientName = *req.RecipientName
	}
	if req.RecipientPhone != nil {
		address.RecipientPhone = *req.RecipientPhone
	}
	if req.Province != nil {
		address.Province = *req.Province
	}
	if req.City != nil {
		address.City = *req.City
	}
	if req.District != nil {
		address.District = *req.District
	}
	if req.PostalCode != nil {
		address.PostalCode = *req.PostalCode
	}
	if req.Address != nil {
		address.Address = *req.Address
	}
	if req.IsDefault != nil {
		address.IsDefault = *req.IsDefault
	}

	if err := s.repo.Update(address); err != nil {
		return nil, err
	}
	return address, nil
}

func (s *AddressService) Delete(id uint, userID uint) error {
	_, err := s.repo.FindByIDAndUserID(id, userID)
	if err != nil {
		return err
	}
	return s.repo.Delete(id, userID)
}
