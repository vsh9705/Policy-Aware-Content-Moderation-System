# Content Moderation System

A Django-based content moderation system with JWT authentication that checks uploaded documents against company policy documents using AI.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and logout
- **Policy Management**: Upload and manage policy PDF documents
- **Content Moderation**: Check documents against policies using RAG Pipeline
- **Moderation History**: Track all moderation results per user
- **Vector Database**: Uses Chroma for efficient policy document retrieval
- **RESTful API**: Built with Django REST Framework

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **AI/ML**: LangChain, Groq LLM, Sentence Transformers
- **Vector Database**: ChromaDB
- **PDF Processing**: PyPDF

## Prerequisites

- Python 3.8+
- pip
- Groq API Key ([Get one here](https://console.groq.com))

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd content-moderation-system
```

### 2. Create virtual environment
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
# - SECRET_KEY: Django secret key
# - GROQ_API_KEY: Your Groq API key
```

### 5. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create superuser (optional)
```bash
python manage.py createsuperuser
```

### 7. Run the development server
```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "password2": "securepassword123",
  "first_name": "Test",
  "last_name": "User"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "testuser",
  "password": "securepassword123"
}

Response:
{
  "user": {...},
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "your-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Get User Profile
```http
GET /api/auth/profile/
Authorization: Bearer <access-token>
```

### Policy Management

#### Upload Policy Documents
```http
POST /api/moderation/upload-policy/
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

files: [policy1.pdf, policy2.pdf]
```

#### List Policies
```http
GET /api/moderation/policies/
Authorization: Bearer <access-token>
```

#### Delete Policy
```http
DELETE /api/moderation/policies/<id>/
Authorization: Bearer <access-token>
```

#### Clear All Policies
```http
POST /api/moderation/clear-policies/
Authorization: Bearer <access-token>
```

### Moderation

#### Moderate a File
```http
POST /api/moderation/moderate/
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: document.pdf
```

#### Get Moderation History
```http
GET /api/moderation/history/
Authorization: Bearer <access-token>
```

#### Get Moderation Detail
```http
GET /api/moderation/history/<id>/
Authorization: Bearer <access-token>
```

## Usage Flow

1. **Register/Login**: Create an account or login to get JWT tokens
2. **Upload Policies**: Upload one or more policy PDF documents
3. **Moderate Content**: Upload a document to check against policies
4. **View Results**: Check moderation results and history

## Example with cURL

### Register
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password2": "testpass123"
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Upload Policy (save the access token from login)
```bash
curl -X POST http://127.0.0.1:8000/api/moderation/upload-policy/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@policy1.pdf" \
  -F "files=@policy2.pdf"
```

### Moderate File
```bash
curl -X POST http://127.0.0.1:8000/api/moderation/moderate/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@document.pdf"
```

## Project Structure

```
content-moderation-system/
├── backend/                  # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/                 # Authentication app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── moderation/              # Moderation app
│   ├── modules/
│   │   ├── policy_store.py  # Chroma vector store management
│   │   ├── llm.py           # LLM and retrieval chain
│   │   └── moderation_engine.py  # Core moderation logic
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── media/                   # Uploaded files
│   ├── policies/
│   └── moderation_files/
├── policy_store/            # Chroma vector database
├── frontend/                # React based frontend
├── manage.py
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

## Database Models

### User Profile
- Extends Django's built-in User model
- Tracks creation and update timestamps

### Policy Document
- Stores uploaded policy PDFs
- Links to user who uploaded
- Tracks file metadata

### Moderation Result
- Stores results of file moderation
- Links to user who initiated moderation
- Contains verdict and chunk statistics

### Violation Detail
- Stores specific violations found in chunks
- Links to moderation result
- Contains explanation and policy sources

## Admin Panel

Access the Django admin panel at `http://127.0.0.1:8000/admin/`

You can:
- View all users and their profiles
- Manage policy documents
- Review moderation results and violations

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Collecting Static Files
```bash
python manage.py collectstatic
```

## Troubleshooting

### Policy Store Issues
If you encounter issues with the policy store:
```bash
# Clear the policy store
curl -X POST http://127.0.0.1:8000/api/moderation/clear-policies/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```
