package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"pdf-hosting-service/internal/service"
	"github.com/gorilla/mux"
)

type PDFHandler struct {
	Service *service.PDFService
}

func NewPDFHandler(s *service.PDFService) *PDFHandler {
	return &PDFHandler{Service: s}
}

type PDFURLRequest struct {
	DocumentID string `json:"documentId"`
	Query      string `json:"query"`
}

type PDFURLResponse struct {
	URL string `json:"url"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *PDFHandler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"service": "pdf-service",
	})
}

func (h *PDFHandler) GetPDFURL(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var req PDFURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Check Redis cache first
	cacheKey := fmt.Sprintf("pdf:url:%s", req.DocumentID)
	if cached, err := h.Service.Redis.Get(ctx, cacheKey).Result(); err == nil {
		json.NewEncoder(w).Encode(PDFURLResponse{URL: cached})
		return
	}

	// Check if file exists locally
	filename := req.DocumentID + ".pdf"
	filePath := filepath.Join(h.Service.PdfDir, filename)
	
	if _, err := os.Stat(filePath); err == nil {
		// File exists locally
		url := fmt.Sprintf("http://localhost:%s/api/pdfs/%s", os.Getenv("PORT"), filename)
		
		// Cache for 1 hour
		h.Service.Redis.Set(ctx, cacheKey, url, time.Hour)
		
		json.NewEncoder(w).Encode(PDFURLResponse{URL: url})
		return
	}

	// If the file is not found, return a 404 error
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(ErrorResponse{Error: "PDF not found"})
}

func (h *PDFHandler) ServePDF(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	filename := vars["filename"]

	// Security: prevent directory traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") {
		http.Error(w, "Invalid filename", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(h.Service.PdfDir, filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "PDF not found", http.StatusNotFound)
		return
	}

	// Open and serve the file
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Failed to open PDF", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Set headers
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	// Stream the file
	io.Copy(w, file)
}

func (h *PDFHandler) ProxyPDF(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "URL parameter required", http.StatusBadRequest)
		return
	}

	// Validate URL
	allowedDomains := []string{"localhost", "127.0.0.1"}
	isAllowed := false
	for _, domain := range allowedDomains {
		if strings.Contains(url, domain) {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		http.Error(w, "Domain not allowed", http.StatusForbidden)
		return
	}

	// Fetch the PDF
	resp, err := h.Service.Client.Get(url)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch PDF: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Failed to fetch PDF: status %d", resp.StatusCode), http.StatusBadGateway)
		return
	}

	// Set headers
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	// Stream the response
	io.Copy(w, resp.Body)
}

func (h *PDFHandler) ChatHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var req struct {
		Message    string `json:"message"`
		DocumentID string `json:"documentId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	response := fmt.Sprintf("You asked: \"%s\". This is a placeholder AI response.", req.Message)

	json.NewEncoder(w).Encode(map[string]string{
		"response": response,
	})
}
