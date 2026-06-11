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

func (s *InventoryService) GetStockHistory(userID uint, productID uint, page, limit int) (*dto.PaginatedStockHistoryResponse, error) {
	// 1. Authenticate seller
	seller, err := s.sellerRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	// 2. Verify product ownership
	product, err := s.productRepo.FindByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}
	if product.SellerID != seller.ID {
		return nil, errors.New("forbidden")
	}

	// 3. Normalize pagination inputs
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// 4. Query repository
	movements, total, err := s.inventoryRepo.GetStockHistory(productID, page, limit)
	if err != nil {
		return nil, err
	}

	// 5. Map to DTO
	data := make([]dto.StockHistoryItemResponse, 0, len(movements))
	for _, m := range movements {
		data = append(data, dto.StockHistoryItemResponse{
			ID:             m.ID,
			ProductID:      m.ProductID,
			Type:           m.Type,
			QuantityBefore: m.QuantityBefore,
			QuantityChange: m.QuantityChange,
			QuantityAfter:  m.QuantityAfter,
			Notes:          m.Notes,
			CreatedBy:      m.CreatedBy,
			CreatedAt:      m.CreatedAt.String(),
		})
	}

	totalPages := total / int64(limit)
	if total%int64(limit) != 0 {
		totalPages++
	}

	return &dto.PaginatedStockHistoryResponse{
		Data: data,
		Meta: dto.PaginationMeta{
			Page:     page,
			Limit:    limit,
			Total:    total,
			LastPage: totalPages,
		},
	}, nil
}

