package service

import (
	"errors"
	"strings"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/product/repository"
	sellerRepository "github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
)

type ProductService struct {
	repo       *repository.ProductRepository
	sellerRepo *sellerRepository.SellerRepository
}

func NewProductService(repo *repository.ProductRepository, sellerRepo *sellerRepository.SellerRepository) *ProductService {
	return &ProductService{
		repo:       repo,
		sellerRepo: sellerRepo,
	}
}


func (s *ProductService) Create(sellerID, categoryID uint, name, description string, price float64, stock int, unit, imageURL string) (*models.Product, error) {
	slug := generateSlug(name)

	product := &models.Product{
		SellerID:    sellerID,
		CategoryID:  categoryID,
		Name:        name,
		Slug:        slug,
		Description: description,
		Price:       price,
		Stock:       stock,
		Unit:        unit,
		ImageURL:    imageURL,
		IsActive:    true,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) GetAll() ([]models.Product, error) {
	return s.repo.FindAll()
}

func (s *ProductService) GetWithPagination(page, limit int, sort, search string, categoryID uint) ([]models.Product, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.FindWithPagination(page, limit, sort, search, categoryID)
}

func (s *ProductService) GetByID(id uint) (*models.Product, error) {
	return s.repo.FindByID(id)
}

func (s *ProductService) Update(userID uint, id uint, categoryID uint, name, description string, price float64, stock int, unit, imageURL string, isActive *bool) (*models.Product, error) {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if categoryID > 0 {
		product.CategoryID = categoryID
	}
	if name != "" {
		product.Name = name
		product.Slug = generateSlug(name)
	}
	if description != "" {
		product.Description = description
	}
	if price > 0 {
		product.Price = price
	}
	if stock >= 0 {
		product.Stock = stock
	}
	if unit != "" {
		product.Unit = unit
	}
	if imageURL != "" {
		product.ImageURL = imageURL
	}

	if isActive != nil {
		product.IsActive = *isActive
	}

	if err := s.repo.UpdateWithPriceHistory(product, userID); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) UpdatePartial(userID uint, id uint, categoryID *uint, name *string, description string, price *float64, stock *int, unit *string, imageURL string, isActive *bool) (*models.Product, error) {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if categoryID != nil {
		product.CategoryID = *categoryID
	}
	if name != nil {
		product.Name = *name
		product.Slug = generateSlug(*name)
	}
	if description != "" {
		product.Description = description
	}
	if price != nil {
		product.Price = *price
	}
	if stock != nil {
		product.Stock = *stock
	}
	if unit != nil {
		product.Unit = *unit
	}
	if imageURL != "" {
		product.ImageURL = imageURL
	}

	if isActive != nil {
		product.IsActive = *isActive
	}

	if err := s.repo.UpdateWithPriceHistory(product, userID); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(id)
}

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}

func (s *ProductService) UpdatePrice(userID uint, productID uint, newPrice float64) (*models.Product, error) {
	if newPrice <= 0 {
		return nil, errors.New("price must be greater than zero")
	}

	seller, err := s.sellerRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	product, err := s.repo.FindByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if product.SellerID != seller.ID {
		return nil, errors.New("forbidden")
	}

	product.Price = newPrice
	if err := s.repo.UpdateWithPriceHistory(product, userID); err != nil {
		return nil, err
	}

	return product, nil
}