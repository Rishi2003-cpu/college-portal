"""
College Portal - Main Flask Application
Functional backend with SQLite database and WhatsApp integration
"""
from flask import Flask, request, jsonify, render_template, send_from_directory, session, make_response
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import hashlib

# Import local modules
from config import config
from models import db, Student, OutingRequest, XeroxOrder, MessOrder, FivestarOrder, CCDOrder, StationaryOrder, RequestStatus

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'college-portal-secret-key')
    
    # Configure session cookie for cross-origin credentials
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    
    # Enable CORS
    CORS(app, supports_credentials=True, origins=['http://localhost:5001', 'http://127.0.0.1:5001'])
    
    # Initialize database
    db.init_app(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})
    
    # ==================== AUTHENTICATION ROUTES ====================
    
    def hash_password(password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @app.route('/api/login', methods=['POST'])
    def login():
        """Authenticate user and return token"""
        data = request.get_json()
        
        login_id = data.get('login_id')  # Student ID or Phone
        password = data.get('password')
        
        if not login_id or not password:
            return jsonify({'error': 'Login ID and password are required'}), 400
        
        # Find student by ID or phone
        student = Student.query.filter(
            (Student.student_id == login_id) | (Student.phone == login_id)
        ).first()
        
        if not student:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if student.password != hash_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create session
        session['student_id'] = student.id
        session['student_name'] = student.name
        
        return jsonify({
            'message': 'Login successful',
            'student': {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'email': student.email,
                'phone': student.phone,
                'hostel_room': student.hostel_room,
                'blood_group': student.blood_group
            }
        })
    
    @app.route('/api/signup', methods=['POST'])
    def signup():
        """Register new student"""
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'name', 'email', 'phone', 'password', 
                          'emergency_contact', 'hostel_room', 'blood_group']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if student already exists
        existing = Student.query.filter(
            (Student.student_id == data.get('student_id')) | 
            (Student.email == data.get('email')) |
            (Student.phone == data.get('phone'))
        ).first()
        
        if existing:
            if existing.student_id == data.get('student_id'):
                return jsonify({'error': 'Student ID already registered'}), 400
            if existing.email == data.get('email'):
                return jsonify({'error': 'Email already registered'}), 400
            if existing.phone == data.get('phone'):
                return jsonify({'error': 'Phone number already registered'}), 400
        
        # Create new student
        student = Student(
            student_id=data.get('student_id'),
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            password=hash_password(data.get('password')),
            emergency_contact=data.get('emergency_contact'),
            hostel_room=data.get('hostel_room'),
            blood_group=data.get('blood_group')
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Account created successfully',
            'student': {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'email': student.email,
                'phone': student.phone,
                'hostel_room': student.hostel_room,
                'blood_group': student.blood_group
            }
        }), 201
    
    @app.route('/api/logout', methods=['POST'])
    def logout():
        """Logout user"""
        session.clear()
        return jsonify({'message': 'Logged out successfully'})
    
    @app.route('/api/me', methods=['GET'])
    def get_current_user():
        """Get current logged in user"""
        student_id = session.get('student_id')
        if not student_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': student.id,
            'student_id': student.student_id,
            'name': student.name,
            'email': student.email,
            'phone': student.phone,
            'hostel_room': student.hostel_room,
            'blood_group': student.blood_group
        })
    
    @app.route('/api/demo-login', methods=['POST'])
    def demo_login():
        """Login with demo account"""
        # Ensure tables exist
        db.create_all()
        
        # Find or create demo student
        demo = Student.query.filter_by(student_id='21CS001').first()
        
        if not demo:
            # Create demo student if not exists
            demo = Student(
                student_id='21CS001',
                name='Demo Student',
                email='demo@college.edu',
                phone='+919999999999',
                password=hash_password('demo123'),
                emergency_contact='+911111111111',
                hostel_room='A-101',
                blood_group='O+'
            )
            db.session.add(demo)
            db.session.commit()
        
        # Create session
        session['student_id'] = demo.id
        session['student_name'] = demo.name
        
        return jsonify({
            'message': 'Demo login successful',
            'student': {
                'id': demo.id,
                'student_id': demo.student_id,
                'name': demo.name,
                'email': demo.email,
                'phone': demo.phone,
                'hostel_room': demo.hostel_room,
                'blood_group': demo.blood_group
            }
        })
    
    # ==================== STUDENT ROUTES ====================
    
    @app.route('/api/students', methods=['GET'])
    def get_students():
        students = Student.query.all()
        return jsonify({'students': [s.to_dict() for s in students]})
    
    @app.route('/api/students/<int:student_id>', methods=['GET'])
    def get_student(student_id):
        student = Student.query.get_or_404(student_id)
        return jsonify(student.to_dict())
    
    @app.route('/api/students', methods=['POST'])
    def create_student():
        data = request.get_json()
        
        # Check if student already exists
        existing = Student.query.filter_by(student_id=data.get('student_id')).first()
        if existing:
            return jsonify({'error': 'Student with this ID already exists'}), 400
        
        student = Student(
            student_id=data.get('student_id'),
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            emergency_contact=data.get('emergency_contact'),
            hostel_room=data.get('hostel_room'),
            blood_group=data.get('blood_group')
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({'message': 'Student created successfully', 'student': student.to_dict()}), 201
    
    @app.route('/api/students/<int:student_id>', methods=['PUT'])
    def update_student(student_id):
        student = Student.query.get_or_404(student_id)
        data = request.get_json()
        
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.phone = data.get('phone', student.phone)
        student.emergency_contact = data.get('emergency_contact', student.emergency_contact)
        student.hostel_room = data.get('hostel_room', student.hostel_room)
        student.blood_group = data.get('blood_group', student.blood_group)
        
        db.session.commit()
        
        return jsonify({'message': 'Student updated successfully', 'student': student.to_dict()})
    
    # ==================== OUTING REQUEST ROUTES ====================
    
    @app.route('/api/outing-requests', methods=['GET'])
    def get_outing_requests():
        student_id = request.args.get('student_id')
        if student_id:
            requests = OutingRequest.query.filter_by(student_id=student_id).order_by(OutingRequest.created_at.desc()).all()
        else:
            requests = OutingRequest.query.order_by(OutingRequest.created_at.desc()).all()
        return jsonify({'requests': [r.to_dict() for r in requests]})
    
    @app.route('/api/outing-requests/<int:request_id>', methods=['GET'])
    def get_outing_request(request_id):
        request_obj = OutingRequest.query.get_or_404(request_id)
        return jsonify(request_obj.to_dict())
    
    @app.route('/api/outing-requests', methods=['POST'])
    def create_outing_request():
        data = request.get_json()
        
        # Validate student exists
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        outing_request = OutingRequest(
            student_id=data.get('student_id'),
            outing_date=datetime.fromisoformat(data.get('outing_date')),
            return_date=datetime.fromisoformat(data.get('return_date')),
            reason=data.get('reason'),
            details=data.get('details'),
            emergency_contact=data.get('emergency_contact')
        )
        
        db.session.add(outing_request)
        db.session.commit()
        
        # Log status
        status_log = RequestStatus(
            request_type='outing',
            request_id=outing_request.id,
            status='pending',
            notes='Outing request submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Outing request submitted successfully',
            'request': outing_request.to_dict()
        }), 201
    
    @app.route('/api/outing-requests/<int:request_id>/status', methods=['PUT'])
    def update_outing_status(request_id):
        request_obj = OutingRequest.query.get_or_404(request_id)
        data = request.get_json()
        
        request_obj.status = data.get('status', request_obj.status)
        
        # Log status change
        status_log = RequestStatus(
            request_type='outing',
            request_id=request_obj.id,
            status=request_obj.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'request': request_obj.to_dict()
        })
    
    # ==================== XEROX ORDER ROUTES ====================
    
    @app.route('/api/xerox-orders', methods=['GET'])
    def get_xerox_orders():
        student_id = request.args.get('student_id')
        if student_id:
            orders = XeroxOrder.query.filter_by(student_id=student_id).order_by(XeroxOrder.created_at.desc()).all()
        else:
            orders = XeroxOrder.query.order_by(XeroxOrder.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]})
    
    @app.route('/api/xerox-orders', methods=['POST'])
    def create_xerox_order():
        data = request.get_json()
        
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        order = XeroxOrder(
            student_id=data.get('student_id'),
            service_type=data.get('service_type'),
            pages=data.get('pages'),
            delivery_location=data.get('delivery_location'),
            instructions=data.get('instructions'),
            contact_number=data.get('contact_number')
        )
        
        db.session.add(order)
        db.session.commit()
        
        status_log = RequestStatus(
            request_type='xerox',
            request_id=order.id,
            status='pending',
            notes='Xerox order submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Xerox order submitted successfully',
            'order': order.to_dict()
        }), 201
    
    @app.route('/api/xerox-orders/<int:order_id>/status', methods=['PUT'])
    def update_xerox_status(order_id):
        order = XeroxOrder.query.get_or_404(order_id)
        data = request.get_json()
        
        order.status = data.get('status', order.status)
        
        status_log = RequestStatus(
            request_type='xerox',
            request_id=order.id,
            status=order.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'order': order.to_dict()
        })
    
    # ==================== MESS ORDER ROUTES ====================
    
    @app.route('/api/mess-orders', methods=['GET'])
    def get_mess_orders():
        student_id = request.args.get('student_id')
        if student_id:
            orders = MessOrder.query.filter_by(student_id=student_id).order_by(MessOrder.created_at.desc()).all()
        else:
            orders = MessOrder.query.order_by(MessOrder.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]})
    
    @app.route('/api/mess-orders', methods=['POST'])
    def create_mess_order():
        data = request.get_json()
        
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        order = MessOrder(
            student_id=data.get('student_id'),
            meal_type=data.get('meal_type'),
            meal_date=datetime.fromisoformat(data.get('meal_date')).date(),
            quantity=data.get('quantity', 1),
            special_requests=data.get('special_requests')
        )
        
        db.session.add(order)
        db.session.commit()
        
        status_log = RequestStatus(
            request_type='mess',
            request_id=order.id,
            status='pending',
            notes='Mess order submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Mess order submitted successfully',
            'order': order.to_dict()
        }), 201
    
    @app.route('/api/mess-orders/<int:order_id>/status', methods=['PUT'])
    def update_mess_status(order_id):
        order = MessOrder.query.get_or_404(order_id)
        data = request.get_json()
        
        order.status = data.get('status', order.status)
        
        status_log = RequestStatus(
            request_type='mess',
            request_id=order.id,
            status=order.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'order': order.to_dict()
        })
    
    # ==================== FIVESTAR ORDER ROUTES ====================
    
    @app.route('/api/fivestar-orders', methods=['GET'])
    def get_fivestar_orders():
        student_id = request.args.get('student_id')
        if student_id:
            orders = FivestarOrder.query.filter_by(student_id=student_id).order_by(FivestarOrder.created_at.desc()).all()
        else:
            orders = FivestarOrder.query.order_by(FivestarOrder.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]})
    
    @app.route('/api/fivestar-orders', methods=['POST'])
    def create_fivestar_order():
        data = request.get_json()
        
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        order = FivestarOrder(
            student_id=data.get('student_id'),
            category=data.get('category'),
            item=data.get('item'),
            quantity=data.get('quantity', 1),
            delivery_option=data.get('delivery_option'),
            instructions=data.get('instructions'),
            contact_number=data.get('contact_number')
        )
        
        db.session.add(order)
        db.session.commit()
        
        status_log = RequestStatus(
            request_type='fivestar',
            request_id=order.id,
            status='pending',
            notes='Fivestar order submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Fivestar order submitted successfully',
            'order': order.to_dict()
        }), 201
    
    @app.route('/api/fivestar-orders/<int:order_id>/status', methods=['PUT'])
    def update_fivestar_status(order_id):
        order = FivestarOrder.query.get_or_404(order_id)
        data = request.get_json()
        
        order.status = data.get('status', order.status)
        
        status_log = RequestStatus(
            request_type='fivestar',
            request_id=order.id,
            status=order.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'order': order.to_dict()
        })
    
    # ==================== CCD ORDER ROUTES ====================
    
    @app.route('/api/ccd-orders', methods=['GET'])
    def get_ccd_orders():
        student_id = request.args.get('student_id')
        if student_id:
            orders = CCDOrder.query.filter_by(student_id=student_id).order_by(CCDOrder.created_at.desc()).all()
        else:
            orders = CCDOrder.query.order_by(CCDOrder.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]})
    
    @app.route('/api/ccd-orders', methods=['POST'])
    def create_ccd_order():
        data = request.get_json()
        
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        order = CCDOrder(
            student_id=data.get('student_id'),
            category=data.get('category'),
            item=data.get('item'),
            quantity=data.get('quantity', 1),
            size=data.get('size'),
            instructions=data.get('instructions'),
            contact_number=data.get('contact_number')
        )
        
        db.session.add(order)
        db.session.commit()
        
        status_log = RequestStatus(
            request_type='ccd',
            request_id=order.id,
            status='pending',
            notes='CCD order submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'CCD order submitted successfully',
            'order': order.to_dict()
        }), 201
    
    @app.route('/api/ccd-orders/<int:order_id>/status', methods=['PUT'])
    def update_ccd_status(order_id):
        order = CCDOrder.query.get_or_404(order_id)
        data = request.get_json()
        
        order.status = data.get('status', order.status)
        
        status_log = RequestStatus(
            request_type='ccd',
            request_id=order.id,
            status=order.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'order': order.to_dict()
        })
    
    # ==================== STATIONARY ORDER ROUTES ====================
    
    @app.route('/api/stationary-orders', methods=['GET'])
    def get_stationary_orders():
        student_id = request.args.get('student_id')
        if student_id:
            orders = StationaryOrder.query.filter_by(student_id=student_id).order_by(StationaryOrder.created_at.desc()).all()
        else:
            orders = StationaryOrder.query.order_by(StationaryOrder.created_at.desc()).all()
        return jsonify({'orders': [o.to_dict() for o in orders]})
    
    @app.route('/api/stationary-orders', methods=['POST'])
    def create_stationary_order():
        data = request.get_json()
        
        student = Student.query.get(data.get('student_id'))
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        order = StationaryOrder(
            student_id=data.get('student_id'),
            category=data.get('category'),
            item=data.get('item'),
            quantity=data.get('quantity', 1),
            delivery_option=data.get('delivery_option'),
            instructions=data.get('instructions'),
            contact_number=data.get('contact_number')
        )
        
        db.session.add(order)
        db.session.commit()
        
        status_log = RequestStatus(
            request_type='stationary',
            request_id=order.id,
            status='pending',
            notes='Stationary order submitted'
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Stationary order submitted successfully',
            'order': order.to_dict()
        }), 201
    
    @app.route('/api/stationary-orders/<int:order_id>/status', methods=['PUT'])
    def update_stationary_status(order_id):
        order = StationaryOrder.query.get_or_404(order_id)
        data = request.get_json()
        
        order.status = data.get('status', order.status)
        
        status_log = RequestStatus(
            request_type='stationary',
            request_id=order.id,
            status=order.status,
            updated_by=data.get('updated_by'),
            notes=data.get('notes')
        )
        db.session.add(status_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'order': order.to_dict()
        })
    
    # ==================== STATUS HISTORY ROUTES ====================
    
    @app.route('/api/status-history/<request_type>/<int:request_id>', methods=['GET'])
    def get_status_history(request_type, request_id):
        history = RequestStatus.query.filter_by(
            request_type=request_type,
            request_id=request_id
        ).order_by(RequestStatus.created_at.desc()).all()
        return jsonify({'history': [h.to_dict() for h in history]})
    
    # ==================== DASHBOARD STATS ====================
    
    @app.route('/api/dashboard/stats', methods=['GET'])
    def get_dashboard_stats():
        stats = {
            'total_students': Student.query.count(),
            'pending_outings': OutingRequest.query.filter_by(status='pending').count(),
            'pending_xerox': XeroxOrder.query.filter_by(status='pending').count(),
            'pending_mess': MessOrder.query.filter_by(status='pending').count(),
            'pending_fivestar': FivestarOrder.query.filter_by(status='pending').count(),
            'pending_ccd': CCDOrder.query.filter_by(status='pending').count(),
            'pending_stationary': StationaryOrder.query.filter_by(status='pending').count(),
            'today_orders': {
                'outing': OutingRequest.query.filter(db.func.date(OutingRequest.created_at) == datetime.now().date()).count(),
                'xerox': XeroxOrder.query.filter(db.func.date(XeroxOrder.created_at) == datetime.now().date()).count(),
                'mess': MessOrder.query.filter(db.func.date(MessOrder.created_at) == datetime.now().date()).count(),
                'fivestar': FivestarOrder.query.filter(db.func.date(FivestarOrder.created_at) == datetime.now().date()).count(),
                'ccd': CCDOrder.query.filter(db.func.date(CCDOrder.created_at) == datetime.now().date()).count(),
                'stationary': StationaryOrder.query.filter(db.func.date(StationaryOrder.created_at) == datetime.now().date()).count()
            }
        }
        return jsonify(stats)
    
    # ==================== WHATSAPP INTEGRATION ====================

    @app.route('/api/whatsapp/send', methods=['POST'])
    def send_whatsapp_message():
        """Send WhatsApp message via Twilio"""
        data = request.get_json()

        phone = data.get('phone')
        message = data.get('message')
        service = data.get('service', 'general')

        if not phone or not message:
            return jsonify({'error': 'Phone number and message are required'}), 400

        try:
            # Import Twilio client
            from twilio.rest import Client

            # Get Twilio credentials from environment
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')  # Twilio sandbox number

            if not account_sid or not auth_token:
                # Fallback to logging if Twilio not configured
                print(f"WhatsApp message to {phone}: {message}")
                return jsonify({
                    'message': 'WhatsApp message logged (Twilio not configured)',
                    'phone': phone,
                    'service': service
                })

            client = Client(account_sid, auth_token)

            # Format phone number for WhatsApp
            if not phone.startswith('+'):
                phone = f'+91{phone}'  # Assuming Indian numbers, adjust as needed

            # Send WhatsApp message
            message_response = client.messages.create(
                from_=whatsapp_number,
                body=message,
                to=f'whatsapp:{phone}'
            )

            return jsonify({
                'message': 'WhatsApp message sent successfully',
                'message_sid': message_response.sid,
                'phone': phone,
                'service': service
            })

        except Exception as e:
            print(f"Error sending WhatsApp message: {e}")
            return jsonify({'error': 'Failed to send WhatsApp message', 'details': str(e)}), 500
    
    # ==================== WEBHOOKS ====================
    
    @app.route('/api/webhook/whatsapp', methods=['POST'])
    def whatsapp_webhook():
        """Handle incoming WhatsApp messages"""
        data = request.get_json()
        
        # Process incoming WhatsApp messages
        # This can be used for status updates from admins
        
        return jsonify({'status': 'received'})
    
    # ==================== FRONTEND ROUTES ====================

    @app.route('/')
    def index():
        """Serve the main HTML file"""
        return send_from_directory('templates', 'index.html')

    @app.route('/static/<path:path>')
    def static_files(path):
        """Serve static files"""
        return send_from_directory('static', path)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

# Create application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0:0', port=5001, debug=True)

