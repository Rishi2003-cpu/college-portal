# College Portal - Student Services Web Application

A comprehensive one-stop portal for college students to access various campus services including outing permissions, mess orders, xerox services, and orders from campus shops (Five Star, CCD, Stationery).

## 🚀 Features

- **Outing Permission System**: Request and track outing permissions with WhatsApp notifications to parents and security
- **Mess Orders**: Pre-order meals with special dietary requirements
- **Xerox Services**: Print, photocopy, binding, and lamination orders
- **Campus Shop Orders**: Order from Five Star, CCD, and Stationery shops
- **Real-time Status Tracking**: Track all your requests in one dashboard
- **WhatsApp Integration**: Receive updates via WhatsApp
- **User Authentication**: Secure login/signup with localStorage

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **External Integration**: Twilio WhatsApp API

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd web dev 5
```

### 2. Create Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database (optional - uses SQLite by default)
DATABASE_URI=sqlite:///portal.db

# Twilio WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Admin WhatsApp Number
ADMIN_WHATSAPP=+919999999999

# Shop Contact Numbers
XEROX_SHOP=+919999999999
MESS_MANAGER=+919999999999
FIVESTAR_RESTAURANT=+919999999999
CCD=+919999999999
STATIONARY_SHOP=+919999999999
SECURITY_OFFICE=+919999999999

# Application Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### 5. Initialize Database
```bash
# The database will be created automatically when you run the app
python app.py
```

## 🎮 Running the Application

### Development Mode
```bash
python app.py
```
The application will start at `http://localhost:5000`

### Using Flask CLI
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

## 📱 Using the Frontend

### Option 1: With Backend (Recommended)
1. Run the Flask application
2. Open `http://localhost:5000` in your browser
3. The app serves the standalone.html file

### Option 2: Standalone Mode (Offline)
Simply open `standalone.html` directly in your browser:
```bash
# On macOS
open standalone.html

# On Linux
xdg-open standalone.html

# On Windows
start standalone.html
```
Note: Some features like WhatsApp integration require the backend to be running.

## 🔐 User Registration

1. Open the application
2. Click "Sign Up" tab
3. Fill in all required fields:
   - Personal Information (Name, Student ID, Email, Phone)
   - Emergency Contact
   - Hostel Room Number
   - Blood Group
   - Create a password
4. Click "Create Account"
5. Login with your Student ID or Phone number

## 📋 API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/<id>` - Get student by ID
- `PUT /api/students/<id>` - Update student

### Outing Requests
- `GET /api/outing-requests` - Get outing requests
- `POST /api/outing-requests` - Create outing request
- `PUT /api/outing-requests/<id>/status` - Update status

### Xerox Orders
- `GET /api/xerox-orders` - Get xerox orders
- `POST /api/xerox-orders` - Create xerox order
- `PUT /api/xerox-orders/<id>/status` - Update status

### Mess Orders
- `GET /api/mess-orders` - Get mess orders
- `POST /api/mess-orders` - Create mess order
- `PUT /api/mess-orders/<id>/status` - Update status

### Five Star Orders
- `GET /api/fivestar-orders` - Get Five Star orders
- `POST /api/fivestar-orders` - Create Five Star order
- `PUT /api/fivestar-orders/<id>/status` - Update status

### CCD Orders
- `GET /api/ccd-orders` - Get CCD orders
- `POST /api/ccd-orders` - Create CCD order
- `PUT /api/ccd-orders/<id>/status` - Update status

### Stationery Orders
- `GET /api/stationary-orders` - Get stationery orders
- `POST /api/stationary-orders` - Create stationery order
- `PUT /api/stationary-orders/<id>/status` - Update status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### WhatsApp
- `POST /api/whatsapp/send` - Send WhatsApp message
- `POST /api/webhook/whatsapp` - WhatsApp webhook handler

## 📊 Database Schema

### Students Table
- id, student_id, name, email, phone
- emergency_contact, hostel_room, blood_group
- created_at, updated_at

### Orders Tables (Xerox, Mess, Five Star, CCD, Stationery)
- id, student_id, service/category/item details
- quantity, delivery_option, instructions
- contact_number, status
- created_at, updated_at

### Outing Requests Table
- id, student_id, outing_date, return_date
- reason, details, emergency_contact
- status, parent_notified, security_notified

### Request Status History
- Tracks all status changes for audit trail

## 🎨 UI Components

### Dashboard Cards
- Outing Permission
- Xerox Services
- Mess Orders
- Five Star Restaurant
- CCD (Cafe Coffee Day)
- Stationery Shop

### Modals
- Profile viewing
- All service order forms
- Status tracking

### Features
- Toast notifications
- Loading states
- Form validation
- Responsive design
- Dark/Light theme support

## 🔧 Configuration

### Changing Colors
Edit the CSS variables in standalone.html:
```css
:root {
    --primary-color: #4361ee;
    --secondary-color: #3a0ca3;
    --accent-color: #f72585;
    /* ... */
}
```

### Adding New Services
1. Add a new model in models.py
2. Add API routes in app.py
3. Add UI card and modal in standalone.html
4. Add JavaScript handlers

## 🚀 Deployment

### Heroku
```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
heroku create
git push heroku main
```

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 📝 TODO

See TODO.md for planned features and improvements.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, contact:
- Email: support@collegeportal.edu
- Phone: +91-XXXXXXXXXX

---

Made with ❤️ for Students

