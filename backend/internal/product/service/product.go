package service

import (
	"strings"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"github.com/deinsteins/pasarin-web/backend/internal/product/repository"
)

type ProductService struct {
	repo *repository.ProductRepository
}

func NewProductService(repo *repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
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

func (s *ProductService) GetWithPagination(page, limit int, sort string) ([]models.Product, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	return s.repo.FindWithPagination(page, limit, sort)
}

func (s *ProductService) GetByID(id uint) (*models.Product, error) {
	return s.repo.FindByID(id)
}

func (s *ProductService) Update(id uint, categoryID uint, name, description string, price float64, stock int, unit, imageURL string, isActive *bool) (*models.Product, error) {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	product.CategoryID = categoryID
	product.Name = name
	product.Slug = generateSlug(name)
	product.Description = description
	product.Price = price
	product.Stock = stock
	product.Unit = unit
	product.ImageURL = imageURL

	if isActive != nil {
		product.IsActive = *isActive
	}

	if err := s.repo.Update(product); err != nil {
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