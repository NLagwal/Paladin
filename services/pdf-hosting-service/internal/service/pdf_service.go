package service

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type PDFService struct {
	Redis     *redis.Client
	PdfDir    string
	Client    *http.Client
}

func NewPDFService() *PDFService {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	
	pdfDir := os.Getenv("PDF_DIR")
	if pdfDir == "" {
		pdfDir = "./pdfs"
	}

	// Create PDF directory if it doesn't exist
	if err := os.MkdirAll(pdfDir, 0755); err != nil {
		log.Fatalf("Failed to create PDF directory: %v", err)
	}

	return &PDFService{
		Redis: redis.NewClient(&redis.Options{
			Addr:         fmt.Sprintf("%s:6379", redisHost),
			PoolSize:     100,
			MinIdleConns: 20,
			MaxRetries:   3,
		}),
		PdfDir: pdfDir,
		Client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 100,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}
