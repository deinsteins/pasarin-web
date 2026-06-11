package service

import (
	"errors"

	"github.com/deinsteins/pasarin-web/backend/internal/inventory/dto"
	inventoryRepository "github.com/deinsteins/pasarin-web/backend/internal/inventory/repository"
	productRepository "github.com/deinsteins/pasarin-web/backend/internal/product/repository"
	sellerRepository "github.com/deinsteins/pasarin-web/backend/internal/seller/repository"
)

var validTypes = map[string]bool{
	"stock_in":   true,
	"stock_out":  true,
	"adjustment": true,
}

type InventoryService struct {
	inventoryRepo *inventoryRepository.InventoryRepository
	productRepo   *productRepository.ProductRepository
	sellerRepo    *sellerRepository.SellerRepository
}

func NewInventoryService(
	inventoryRepo *inventoryRepository.InventoryRepository,
	productRepo *productRepository.ProductRepository,
	sellerRepo *sellerRepository.SellerRepository,
) *InventoryService {
	return &InventoryService{
		inventoryRepo: inventoryRepo,
		productRepo:   productRepo,
		sellerRepo:    sellerRepo,
	}
}

func (s *InventoryService) AdjustStock(userID uint, productID uint, req dto.StockAdjustmentRequest) (*dto.StockAdjustmentResponse, error) {
	// 1. Validate type
	if !validTypes[req.Type] {
		return nil, errors.New("invalid type: must be stock_in, stock_out, or adjustment")
	}

	// 2. Validate quantity
	if req.Quantity <= 0 {
		return nil, errors.New("quantity must be greater than zero")
	}

	// 3. Authenticate seller
	seller, err := s.sellerRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	// 4. Verify product ownership
	product, err := s.productRepo.FindByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}
	if product.SellerID != seller.ID {
		return nil, errors.New("forbidden")
	}

	// 5. Derive signed quantity change
	quantityChange := req.Quantity
	if req.Type == "stock_out" {
		quantityChange = -req.Quantity
	}

	// 6. Delegate to repository (transaction happens inside)
	movement, err := s.inventoryRepo.AdjustStock(productID, quantityChange, req.Type, req.Notes, userID)
	if err != nil {
		return nil, err
	}

	return &dto.StockAdjustmentResponse{
		ProductID:      movement.ProductID,
		Type:           movement.Type,
		QuantityBefore: movement.QuantityBefore,
		QuantityChange: movement.QuantityChange,
		QuantityAfter:  movement.QuantityAfter,
		Notes:          movement.Notes,
		CreatedAt:      movement.CreatedAt.String(),
	}, nil
}
