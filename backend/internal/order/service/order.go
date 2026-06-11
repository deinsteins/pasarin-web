package service

import (
	"github.com/deinsteins/pasarin-web/backend/internal/order/dto"
	"github.com/deinsteins/pasarin-web/backend/internal/order/repository"
)

type OrderService struct {
	repo *repository.OrderRepository
}

func NewOrderService(repo *repository.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) GetOrderDetail(id uint, userID uint) (*dto.OrderDetailResponse, error) {
	order, items, err := s.repo.GetOrderByIDAndUserID(id, userID)
	if err != nil {
		return nil, err
	}

	var itemsResponse []dto.OrderItemResponse = []dto.OrderItemResponse{}
	for _, item := range items {
		itemsResponse = append(itemsResponse, dto.OrderItemResponse{
			ID:           item.ID,
			ProductID:    item.ProductID,
			SellerID:     item.SellerID,
			ProductName:  item.ProductName,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		})
	}

	return &dto.OrderDetailResponse{
		ID:          order.ID,
		OrderNumber: order.OrderNumber,
		UserID:      order.UserID,
		Status:      order.Status,
		Subtotal:    order.Subtotal,
		DeliveryFee: order.DeliveryFee,
		TotalAmount: order.TotalAmount,
		Notes:       order.Notes,
		CreatedAt:   order.CreatedAt.String(),
		UpdatedAt:   order.UpdatedAt.String(),
		Address: dto.AddressResponse{
			ID:             order.Address.ID,
			Label:          order.Address.Label,
			RecipientName:  order.Address.RecipientName,
			RecipientPhone: order.Address.RecipientPhone,
			Province:       order.Address.Province,
			City:           order.Address.City,
			District:       order.Address.District,
			PostalCode:     order.Address.PostalCode,
			Address:        order.Address.Address,
		},
		Items: itemsResponse,
	}, nil
}
