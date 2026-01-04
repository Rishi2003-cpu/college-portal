"""
Database models for College Portal
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Student(db.Model):
    """Student model for storing student information"""
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Stores hashed password
    emergency_contact = db.Column(db.String(20), nullable=False)
    hostel_room = db.Column(db.String(50), nullable=False)
    blood_group = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    outing_requests = db.relationship('OutingRequest', backref='student', lazy=True)
    xerox_orders = db.relationship('XeroxOrder', backref='student', lazy=True)
    mess_orders = db.relationship('MessOrder', backref='student', lazy=True)
    fivestar_orders = db.relationship('FivestarOrder', backref='student', lazy=True)
    ccd_orders = db.relationship('CCDOrder', backref='student', lazy=True)
    stationary_orders = db.relationship('StationaryOrder', backref='student', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'emergency_contact': self.emergency_contact,
            'hostel_room': self.hostel_room,
            'blood_group': self.blood_group,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class OutingRequest(db.Model):
    """Outing request model"""
    __tablename__ = 'outing_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    outing_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    parent_notified = db.Column(db.Boolean, default=False)
    security_notified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'outing_date': self.outing_date.isoformat() if self.outing_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'reason': self.reason,
            'details': self.details,
            'emergency_contact': self.emergency_contact,
            'status': self.status,
            'parent_notified': self.parent_notified,
            'security_notified': self.security_notified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class XeroxOrder(db.Model):
    """Xerox order model"""
    __tablename__ = 'xerox_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    pages = db.Column(db.Integer, nullable=False)
    delivery_location = db.Column(db.String(50), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    contact_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, processing, ready, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'service_type': self.service_type,
            'pages': self.pages,
            'delivery_location': self.delivery_location,
            'instructions': self.instructions,
            'contact_number': self.contact_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MessOrder(db.Model):
    """Mess order model"""
    __tablename__ = 'mess_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)
    meal_date = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, default=1)
    special_requests = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, prepared, delivered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'meal_type': self.meal_type,
            'meal_date': self.meal_date.isoformat() if self.meal_date else None,
            'quantity': self.quantity,
            'special_requests': self.special_requests,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class FivestarOrder(db.Model):
    """Fivestar Restaurant order model"""
    __tablename__ = 'fivestar_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    item = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    delivery_option = db.Column(db.String(50), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    contact_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, preparing, ready, delivered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'category': self.category,
            'item': self.item,
            'quantity': self.quantity,
            'delivery_option': self.delivery_option,
            'instructions': self.instructions,
            'contact_number': self.contact_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CCDOrder(db.Model):
    """Cafe Coffee Day order model"""
    __tablename__ = 'ccd_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    item = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    size = db.Column(db.String(20), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    contact_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, preparing, ready, delivered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'category': self.category,
            'item': self.item,
            'quantity': self.quantity,
            'size': self.size,
            'instructions': self.instructions,
            'contact_number': self.contact_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class StationaryOrder(db.Model):
    """Stationary shop order model"""
    __tablename__ = 'stationary_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    item = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    delivery_option = db.Column(db.String(50), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    contact_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, processing, ready, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'category': self.category,
            'item': self.item,
            'quantity': self.quantity,
            'delivery_option': self.delivery_option,
            'instructions': self.instructions,
            'contact_number': self.contact_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RequestStatus(db.Model):
    """Model to track all request statuses"""
    __tablename__ = 'request_statuses'
    
    id = db.Column(db.Integer, primary_key=True)
    request_type = db.Column(db.String(50), nullable=False)  # outing, xerox, mess, etc.
    request_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    updated_by = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'request_type': self.request_type,
            'request_id': self.request_id,
            'status': self.status,
            'updated_by': self.updated_by,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

