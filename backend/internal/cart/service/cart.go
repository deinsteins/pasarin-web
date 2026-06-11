package service

import (
	"errors"

	"github.com/deinsteins/pasarin-web/backend/internal/cart/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/cart/repository"
	"github.com/deinsteins/pasarin-web/backend/internal/models"
	"gorm.io/gorm"
)

type CartService struct {
	repo *repository.CartRepository
}

func NewCartService(repo *repository.CartRepository) *CartService {
	return &CartService{repo: repo}
}

func (s *CartService) AddToCart(userID uint, productID uint, quantity int) error {
	product, err := s.repo.GetProductByID(productID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("product not found")
		}
		return err
	}

	// Retrieve or create cart
	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = &models.Cart{
				UserID: userID,
			}
			if err := s.repo.CreateCart(cart); err != nil {
				return err
			}
		} else {
			return err
		}
	}

	// Retrieve existing cart item or create a new one
	item, err := s.repo.GetCartItem(cart.ID, productID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Validate quantity against product stock
			if quantity > product.Stock {
				return errors.New("insufficient stock")
			}

			newItem := &models.CartItem{
				CartID:    cart.ID,
				ProductID: productID,
				Quantity:  quantity,
			}
			return s.repo.CreateCartItem(newItem)
		}
		return err
	}

	// Accumulate quantity
	newQty := item.Quantity + quantity
	if newQty > product.Stock {
		return errors.New("insufficient stock")
	}

	item.Quantity = newQty
	return s.repo.UpdateCartItem(item)
}

func (s *CartService) GetCart(userID uint) (*dto.CartResponse, error) {
	// Retrieve or create cart
	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = &models.Cart{
				UserID: userID,
			}
			if err := s.repo.CreateCart(cart); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	items, err := s.repo.GetCartItemsWithProduct(cart.ID)
	if err != nil {
		return nil, err
	}

	var itemResponses []dto.CartItemResponse = []dto.CartItemResponse{}
	var total float64 = 0.0

	for _, item := range items {
		subtotal := float64(item.Quantity) * item.Product.Price
		total += subtotal

		itemResponses = append(itemResponses, dto.CartItemResponse{
			ID:        item.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
			Product: dto.ProductResponse{
				ID:          item.Product.ID,
				Name:        item.Product.Name,
				Slug:        item.Product.Slug,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				Stock:       item.Product.Stock,
				IsAvailable: item.Product.IsAvailable,
				Unit:        item.Product.Unit,
				ImageURL:    item.Product.ImageURL,
				IsActive:    item.Product.IsActive,
				Seller: dto.SellerResponse{
					ID:        item.Product.Seller.ID,
					StoreName: item.Product.Seller.StoreName,
				},
			},
		})
	}

	return &dto.CartResponse{
		Items: itemResponses,
		Total: total,
	}, nil
}

func (s *CartService) UpdateCartItem(userID uint, itemID uint, quantity int) error {
	item, err := s.repo.GetCartItemByID(itemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cart item not found")
		}
		return err
	}

	cart, err := s.repo.GetCartByID(item.CartID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cart not found")
		}
		return err
	}

	// Ownership validation
	if cart.UserID != userID {
		return errors.New("unauthorized")
	}

	product, err := s.repo.GetProductByID(item.ProductID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("product not found")
		}
		return err
	}

	// Validate stock
	if quantity > product.Stock {
		return errors.New("insufficient stock")
	}

	item.Quantity = quantity
	return s.repo.UpdateCartItem(item)
}

func (s *CartService) DeleteCartItem(userID uint, itemID uint) error {
	item, err := s.repo.GetCartItemByID(itemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cart item not found")
		}
		return err
	}

	cart, err := s.repo.GetCartByID(item.CartID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cart not found")
		}
		return err
	}

	// Ownership validation
	if cart.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.repo.DeleteCartItem(itemID)
}
