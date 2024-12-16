# Full-Stack Inventory Management System

### 

This is a comprehensive, full-stack inventory management application designed to track products, quantities, and prices. The system features a modern, responsive frontend built with React and a robust RESTful API backend powered by Python and Flask. The entire application is containerized with Docker for streamlined development and deployment.

## Key Features

### 

*   **Full CRUD Functionality**: Create, Read, Update, and Delete products in the inventory.
    
*   **Dashboard Analytics**: At-a-glance dashboard cards displaying key metrics like total products, total inventory value, and low-stock items.
    
*   **Real-Time Search**: Instantly filter the product list by name with a responsive search bar.
    
*   **Sortable & Paginated Table**: Click on table headers to sort the inventory by name, quantity, or price. Navigate through large datasets with easy-to-use pagination controls.
    
*   **Status Indicators**: Visual badges in the table quickly identify products that are "In Stock," "Low Stock," or "Out of Stock."
    
*   **Interactive Modals**: Smooth, interactive modals for editing product details and confirming deletions to prevent accidental actions.
    
*   **Toast Notifications**: User-friendly pop-up notifications provide immediate feedback for all successful or failed operations.
    
*   **Containerized Environment**: The entire application stack is orchestrated by Docker Compose, ensuring a consistent and reproducible environment for development and deployment.
    

## Technology Stack

### 

*   **Frontend**: React, Tailwind CSS, Axios
    
*   **Backend**: Python, Flask, Flask-SQLAlchemy
    
*   **Database**: MySQL
    
*   **Containerization**: Docker, Docker Compose
    

## Getting Started

### 

Follow these instructions to get the project running on your local machine.

### Prerequisites

### 

You will need the following tools installed on your system:

*   [Git](https://git-scm.com/ "null")
    
*   [Docker](https://www.docker.com/products/docker-desktop/ "null")
    
*   [Node.js](https://nodejs.org/ "null") and npm/yarn
    

### Installation and Setup

### 

1.  **Clone the Repository**
    
        git clone https://github.com/Sonu2225/Inventory-Management-System.git
        cd Inventory-Management-System
        
    
2.  **Run the Application with Docker** The `docker-compose.yml` file in the root directory will build the images and orchestrate the containers for the frontend, backend, and database.
    
        docker-compose up --build
        
    
    This command will start all the necessary services. The initial build may take a few minutes.
    
3.  **Access the Application** Once the containers are running, you can access the different parts of the application:
    
    *   **Frontend (React App)**: `http://localhost:3000`
        
    *   **Backend (Flask API)**: `http://localhost:5001`
        

The application is now fully running. You can start adding, editing, and managing products through the web interface.