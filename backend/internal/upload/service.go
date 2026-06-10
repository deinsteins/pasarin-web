package upload

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

// AllowedFolders defines valid upload destinations.
var AllowedFolders = map[string]bool{
	"products":   true,
	"stores":     true,
	"categories": true,
	"banners":    true,
	"avatars":    true,
}

// UploadResult holds the result of a successful upload.
type UploadResult struct {
	Key string `json:"key"`
	URL string `json:"url"`
}

type UploadService struct{}

func NewUploadService() *UploadService {
	return &UploadService{}
}

func (s *UploadService) buildClient() (*s3.Client, string, string, error) {
	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKeyID := os.Getenv("R2_ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucket := os.Getenv("R2_BUCKET")
	publicURL := strings.TrimRight(os.Getenv("R2_PUBLIC_URL"), "/")

	if accountID == "" || accessKeyID == "" || secretAccessKey == "" || bucket == "" || publicURL == "" {
		return nil, "", "", fmt.Errorf(
			"missing R2 config: R2_ACCOUNT_ID=%q R2_BUCKET=%q R2_PUBLIC_URL=%q",
			accountID, bucket, publicURL,
		)
	}

	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			accessKeyID, secretAccessKey, "",
		)),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
	})

	return client, bucket, publicURL, nil
}

// UploadFile uploads a file into the given folder in R2.
// Returns UploadResult with key and public URL.
func (s *UploadService) UploadFile(file multipart.File, filename string, folder string) (*UploadResult, error) {
	// Validate folder
	folder = strings.Trim(folder, "/")
	if !AllowedFolders[folder] {
		return nil, fmt.Errorf("invalid folder %q: must be one of products, stores, categories, banners, avatars", folder)
	}

	client, bucket, publicURL, err := s.buildClient()
	if err != nil {
		return nil, err
	}

	// Build object key: folder/uuid-sanitizedname.ext
	ext := strings.ToLower(filepath.Ext(filename))
	sanitized := sanitizeFilename(strings.TrimSuffix(filepath.Base(filename), filepath.Ext(filename)))
	key := fmt.Sprintf("%s/%s-%s%s", folder, uuid.New().String(), sanitized, ext)

	contentType := detectContentType(ext)

	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return nil, fmt.Errorf("R2 PutObject failed: %w", err)
	}

	return &UploadResult{
		Key: key,
		URL: fmt.Sprintf("%s/%s", publicURL, key),
	}, nil
}

// sanitizeFilename removes special characters, replaces spaces with hyphens.
var nonAlphanumeric = regexp.MustCompile(`[^a-zA-Z0-9\-_]`)

func sanitizeFilename(name string) string {
	name = strings.ReplaceAll(name, " ", "-")
	name = nonAlphanumeric.ReplaceAllString(name, "")
	name = strings.ToLower(name)
	if len(name) > 50 {
		name = name[:50]
	}
	return name
}

func detectContentType(ext string) string {
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".pdf":
		return "application/pdf"
	default:
		return "application/octet-stream"
	}
}
