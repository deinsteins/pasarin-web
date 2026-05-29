package service

import (
	"errors"
	"strings"

	"github.com/deinsteins/pasarin-web/backend/internal/category/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type CategoryService struct {
	repo *repository.CategoryRepository
}

func NewCategoryService(repo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) Create(name string) (*models.Category, error) {
	if s.repo.IsDuplicateName(name, 0) {
		return nil, errors.New("category name already exists")
	}

	slug := generateSlug(name)

	category := &models.Category{
		Name: name,
		Slug: slug,
	}

	if err := s.repo.Create(category); err != nil {
		return nil, err
	}

	return category, nil
}

func (s *CategoryService) GetAll() ([]models.Category, error) {
	return s.repo.FindAll()
}

func (s *CategoryService) GetByID(id uint) (*models.Category, error) {
	return s.repo.FindByID(id)
}

func (s *CategoryService) Update(id uint, name string) (*models.Category, error) {
	if s.repo.IsDuplicateName(name, id) {
		return nil, errors.New("category name already exists")
	}

	category, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	category.Name = name
	category.Slug = generateSlug(name)

	if err := s.repo.Update(category); err != nil {
		return nil, err
	}

	return category, nil
}

func (s *CategoryService) Delete(id uint) error {
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