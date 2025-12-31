package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"pdf-hosting-service/internal/handlers"
	"pdf-hosting-service/internal/middleware"
	"pdf-hosting-service/internal/service"
)

func main() {
	service := service.NewPDFService()
	handler := handlers.NewPDFHandler(service)

	// Test Redis connection
	ctx := context.Background()
	if err := service.Redis.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Redis connection failed: %v", err)
	} else {
		log.Println("Redis connected successfully")
	}

	r := mux.NewRouter()

	// Apply middleware
	r.Use(middleware.CorsMiddleware)
	r.Use(middleware.LoggingMiddleware)

	// Routes
	r.HandleFunc("/health", handler.HealthHandler).Methods("GET")
	r.HandleFunc("/api/get-pdf-url", handler.GetPDFURL).Methods("POST")
	r.HandleFunc("/api/proxy-pdf", handler.ProxyPDF).Methods("GET")
	r.HandleFunc("/api/pdfs/{filename}", handler.ServePDF).Methods("GET")
	r.HandleFunc("/api/chat", handler.ChatHandler).Methods("POST")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8006"
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf("0.0.0.0:%s", port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("PDF Service (Go) running on port %s", port)
	log.Printf("Serving PDFs from: %s", service.PdfDir)
	log.Fatal(srv.ListenAndServe())
}