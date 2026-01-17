🐾 Pet Sitting Platform – RESTful API

A request-based pet sitting platform backend that connects pet owners with pet sitters through a secure, role-based RESTful API.
The system enables service requests, sitter offers, bookings, daily pet updates, and reviews, inspired by on-demand negotiation models.

✨ Features

🔐 JWT authentication (Owner / Sitter roles)

🔑 Google OAuth login

🐶 Pet profile management

📍 Service request creation

🤝 Offer submission & acceptance

📅 Booking lifecycle management

📸 Daily pet updates (text & photos)

⭐ Reviews & sitter trust scoring

📄 Swagger / OpenAPI documentation

🛠 Tech Stack

Backend

Python 3

Flask

Flask-Smorest

SQLAlchemy

Marshmallow

Flask-JWT-Extended

Database

PostgreSQL

Testing & Docs

Insomnia / Postman

Swagger (OpenAPI)

Deployment

Docker

Docker Compose

🧱 Architecture Overview
Client (Frontend)
      ↓
REST API (Flask)
      ↓
Business Logic & Validation
      ↓
PostgreSQL Database


Each domain (auth, pets, requests, offers, bookings, reviews) is implemented using modular Flask blueprints.

📌 API Modules
Module	Description
Auth	Registration, login, JWT, OAuth
Pets	Pet CRUD operations
Requests	Service request lifecycle
Offers	Negotiation & acceptance
Bookings	Service execution tracking
Updates	Daily pet updates
Reviews	Ratings & feedback
Sitters	Profile management
🚀 Getting Started
Prerequisites

Docker

Docker Compose

Run the Project
docker-compose up --build

Access the API
http://localhost:5000

Swagger Documentation
http://localhost:5000/swagger-ui

🧪 Testing

Manual and automated API testing using Insomnia and Postman

Tested workflows:

Request → Offer → Booking → Review

Role-based access restrictions

Unauthorized access handling

📁 Project Structure
backend/
├── app/
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   └── extensions.py
├── migrations/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md

⚠️ Limitations

No integrated payment system

No real-time messaging

No mobile application

Basic location filtering only

🔮 Future Enhancements

Payment gateway integration

Real-time chat & notifications

Advanced location-based sitter discovery

Mobile application support

Availability calendar for sitters

🎓 Academic Context

Developed as an academic project at Tunis Business School, focusing on backend engineering, API design, and security.

📄 License

For academic and educational use only
