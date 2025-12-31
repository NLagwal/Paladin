package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/notifications", notificationsHandler).Methods("GET")

	log.Println("🚀 Notification Service running on port 5002")
	log.Fatal(http.ListenAndServe(":5002", r))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy", "service": "Notification Service"})
}

func notificationsHandler(w http.ResponseWriter, r *http.Request) {
	// For now, return a dummy list of notifications
	notifications := []map[string]string{
		{"id": "1", "message": "You have a new message"},
		{"id": "2", "message": "Your request has been approved"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}