package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/deinsteins/pasarin-web/backend/internal/models"
)

type MayarProvider struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

func NewMayarProvider() *MayarProvider {
	apiKey := os.Getenv("MAYAR_API_KEY")
	baseURL := os.Getenv("MAYAR_BASE_URL")
	if baseURL == "" {
		baseURL = "https://api.mayar.id"
	}

	return &MayarProvider{
		apiKey:  apiKey,
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type mayarInvoiceItem struct {
	Quantity    int     `json:"quantity"`
	Rate        float64 `json:"rate"`
	Description string  `json:"description"`
}

type mayarCreateInvoiceRequest struct {
	Name        string             `json:"name"`
	Email       string             `json:"email"`
	Mobile      string             `json:"mobile"`
	Description string             `json:"description"`
	Items       []mayarInvoiceItem `json:"items"`
}

type mayarCreateInvoiceResponse struct {
	StatusCode int    `json:"statusCode"`
	Messages   string `json:"messages"`
	Data       struct {
		ID            string `json:"id"`
		TransactionID string `json:"transactionId"`
		Link          string `json:"link"`
	} `json:"data"`
}

func (p *MayarProvider) CreatePaymentLink(order models.Order) (PaymentLinkResponse, error) {
	mockResponse := PaymentLinkResponse{
		ExternalID:  fmt.Sprintf("mock_%s", order.OrderNumber),
		PaymentURL:  fmt.Sprintf("https://mock.mayar.id/invoices/mock_%s", order.OrderNumber),
		Amount:      order.TotalAmount,
		Status:      "pending",
	}

	if p.apiKey == "" {
		log.Printf("WARNING: Mayar API key is not configured. Falling back to mock payment response for Order %s", order.OrderNumber)
		return mockResponse, nil
	}

	// Prepare description
	desc := fmt.Sprintf("Payment for Order %s", order.OrderNumber)

	// Prepare items
	var invoiceItems []mayarInvoiceItem
	if len(order.OrderItems) > 0 {
		for _, item := range order.OrderItems {
			productName := item.ProductName
			if productName == "" {
				productName = fmt.Sprintf("Product Item %d", item.ProductID)
			}
			invoiceItems = append(invoiceItems, mayarInvoiceItem{
				Quantity:    item.Quantity,
				Rate:        item.ProductPrice,
				Description: productName,
			})
		}
	} else {
		// Fallback if OrderItems are not preloaded
		invoiceItems = append(invoiceItems, mayarInvoiceItem{
			Quantity:    1,
			Rate:        order.TotalAmount,
			Description: desc,
		})
	}

	// Prepare customer info
	customerName := order.User.Name
	if customerName == "" {
		customerName = order.Address.RecipientName
	}
	if customerName == "" {
		customerName = "Customer"
	}

	customerEmail := order.User.Email
	if customerEmail == "" {
		customerEmail = "customer@example.com"
	}

	customerMobile := order.Address.RecipientPhone
	if customerMobile == "" {
		customerMobile = "081234567890" // Mayar requires a mobile number
	}

	reqBody := mayarCreateInvoiceRequest{
		Name:        customerName,
		Email:       customerEmail,
		Mobile:      customerMobile,
		Description: desc,
		Items:       invoiceItems,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return PaymentLinkResponse{}, fmt.Errorf("failed to marshal Mayar request: %w", err)
	}

	baseURL := strings.TrimSuffix(p.baseURL, "/")
	var url string
	if strings.Contains(baseURL, "/hl/v1") {
		url = fmt.Sprintf("%s/invoice/create", baseURL)
	} else {
		url = fmt.Sprintf("%s/hl/v1/invoice/create", baseURL)
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return PaymentLinkResponse{}, fmt.Errorf("failed to create HTTP request for Mayar: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", p.apiKey))

	resp, err := p.client.Do(req)
	if err != nil {
		log.Printf("WARNING: Mayar API call failed (%v). Falling back to mock payment response for Order %s", err, order.OrderNumber)
		return mockResponse, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return PaymentLinkResponse{}, fmt.Errorf("mayar API returned error status %d: %v", resp.StatusCode, errResp)
	}

	var responseData mayarCreateInvoiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&responseData); err != nil {
		return PaymentLinkResponse{}, fmt.Errorf("failed to decode Mayar response: %w", err)
	}

	// Map statusCode if returned in response body, else use HTTP 200
	if responseData.StatusCode != http.StatusOK && responseData.StatusCode != 201 && responseData.StatusCode != 0 {
		return PaymentLinkResponse{}, fmt.Errorf("mayar API response status: %d, message: %s", responseData.StatusCode, responseData.Messages)
	}

	return PaymentLinkResponse{
		ExternalID:  responseData.Data.ID,
		PaymentURL:  responseData.Data.Link,
		Amount:      order.TotalAmount,
		Status:      "pending",
	}, nil
}
