import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# DATABASE CONFIGURATION
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- DEFINE THE PRODUCT MODEL ---
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'price': self.price
        }

# CREATE DATABASE TABLES
with app.app_context():
    db.create_all()

# --- API ENDPOINTS ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Calculates and returns key inventory statistics."""
    total_products = db.session.query(Product).count()
    
    # Calculate total value using SQLAlchemy's func.sum
    total_value_query = db.session.query(func.sum(Product.price * Product.quantity)).scalar()
    total_value = total_value_query or 0 # Default to 0 if there are no products
    
    # Low stock is quantity > 0 and <= 10
    low_stock_count = db.session.query(Product).filter(Product.quantity <= 10, Product.quantity > 0).count()
    
    return jsonify({
        'totalProducts': total_products,
        'totalValue': total_value,
        'lowStockCount': low_stock_count
    })


@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_json() for product in products])

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'],
        quantity=data['quantity'],
        price=data['price']
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.to_json()), 201

# Endpoint to update a product
@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    product.name = data['name']
    product.quantity = data['quantity']
    product.price = data['price']

    db.session.commit()
    return jsonify(product.to_json())

# Endpoint to delete a product
@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/')
def home():
    return "Flask server is connected to the database!"

# Run the application directly
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
