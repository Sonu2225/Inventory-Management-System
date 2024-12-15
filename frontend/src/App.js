import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Helper Icon Components ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const SortIcon = ({ direction }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ml-2 transition-transform duration-200 ${direction === 'ascending' ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>;

// --- UI Helper Components ---
const QuantityStatus = ({ quantity }) => {
  const LOW_STOCK_THRESHOLD = 10;
  let badgeClasses = '', statusText = '';
  if (quantity > LOW_STOCK_THRESHOLD) { badgeClasses = 'bg-green-100 text-green-800'; statusText = 'In Stock'; } 
  else if (quantity > 0) { badgeClasses = 'bg-yellow-100 text-yellow-800'; statusText = 'Low Stock'; } 
  else { badgeClasses = 'bg-red-100 text-red-800'; statusText = 'Out of Stock'; }
  return (
    <div className="flex items-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeClasses}`}>{statusText}</span><span className="ml-3 text-sm text-slate-500">({quantity})</span></div>
  );
};

const TableSkeleton = () => (
  <div className="p-4 animate-pulse"><div className="h-8 bg-slate-200 rounded mb-4"></div><div className="space-y-2"><div className="h-12 bg-slate-200 rounded"></div><div className="h-12 bg-slate-200 rounded"></div><div className="h-12 bg-slate-200 rounded"></div></div></div>
);

const API_URL = 'http://localhost:5001/api/products';
const STATS_API_URL = 'http://localhost:5001/api/stats';

function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, lowStockCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', price: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      axios.get(API_URL),
      axios.get(STATS_API_URL)
    ]).then(([productsResponse, statsResponse]) => {
      setProducts(productsResponse.data);
      setStats(statsResponse.data);
    }).catch(error => {
      console.error("Error fetching data:", error);
      toast.error("Could not fetch data from the server.");
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const processedProducts = useMemo(() => {
    let processableProducts = [...products];
    if (searchTerm) {
      processableProducts = processableProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortConfig.key) {
      processableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return processableProducts;
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    setSortConfig({ key, direction });
  };
  
  const handleInputChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  
  const handleAddProduct = (e) => {
    e.preventDefault();
    const productToSend = { ...newProduct, quantity: parseInt(newProduct.quantity, 10), price: parseFloat(newProduct.price) };
    axios.post(API_URL, productToSend).then(() => { fetchData(); setNewProduct({ name: '', quantity: '', price: '' }); toast.success('Product added!'); }).catch(() => toast.error('Failed to add product.'));
  };
  
  const handleDeleteProduct = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => { fetchData(); toast.success('Product deleted!'); }).catch(() => toast.error('Failed to delete product.'));
  };

  const openEditModal = (product) => { setCurrentProduct(product); setIsModalOpen(true); };
  const closeEditModal = () => { setIsModalOpen(false); setCurrentProduct(null); };
  
  const openDeleteModal = (id) => { setProductToDelete(id); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setProductToDelete(null); setIsDeleteModalOpen(false); };
  const confirmDelete = () => { handleDeleteProduct(productToDelete); closeDeleteModal(); };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const productToUpdate = { ...currentProduct, quantity: parseInt(currentProduct.quantity, 10), price: parseFloat(currentProduct.price) };
    axios.put(`${API_URL}/${currentProduct.id}`, productToUpdate).then(() => { fetchData(); closeEditModal(); toast.success('Product updated!'); }).catch(() => toast.error('Failed to update product.'));
  };

  const handleModalInputChange = (e) => setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });

  const SortableHeader = ({ label, sortKey }) => (
    <th className="p-4 font-semibold text-slate-600 cursor-pointer" onClick={() => requestSort(sortKey)}><div className="flex items-center">{label}{sortConfig.key === sortKey && <SortIcon direction={sortConfig.direction} />}</div></th>
  );

  return (  
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick />
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Inventory Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage and track your product inventory.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-slate-500 mb-2">Total Products</h3><p className="text-4xl font-bold text-blue-600">{stats.totalProducts}</p></div>
          <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-slate-500 mb-2">Total Value</h3><p className="text-4xl font-bold text-blue-600">${stats.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
          <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-slate-500 mb-2">Low Stock Items</h3><p className="text-4xl font-bold text-yellow-500">{stats.lowStockCount}</p></div>
        </div>
        
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Product Name" required className="p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input name="quantity" type="number" value={newProduct.quantity} onChange={handleInputChange} placeholder="Quantity" required className="p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input name="price" type="number" step="0.01" value={newProduct.price} onChange={handleInputChange} placeholder="Price" required className="p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Add Product</button>
          </form>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Search products by name..." className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          {isLoading ? <TableSkeleton /> : (
            <table className="w-full text-left">
              <thead className="bg-slate-200">
                <tr>
                  <SortableHeader label="Product Name" sortKey="name" />
                  <SortableHeader label="Status" sortKey="quantity" />
                  <SortableHeader label="Price" sortKey="price" />
                  <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4"><QuantityStatus quantity={product.quantity} /></td>
                    <td className="p-4">${product.price.toFixed(2)}</td>
                    <td className="p-4 flex justify-center items-center space-x-2">
                      <button onClick={() => openEditModal(product)} className="text-slate-500 hover:text-blue-600 p-1 rounded-full transition duration-300"><EditIcon /></button>
                      <button onClick={() => openDeleteModal(product.id)} className="text-slate-500 hover:text-red-600 p-1 rounded-full transition duration-300"><DeleteIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && totalPages > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-slate-400 transition">Previous</button>
            <span className="text-slate-600 font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-slate-400 transition">Next</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6">Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Name</label>
                <input name="name" value={currentProduct.name} onChange={handleModalInputChange} className="p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Quantity</label>
                <input name="quantity" type="number" value={currentProduct.quantity} onChange={handleModalInputChange} className="p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2">Price</label>
                <input name="price" type="number" step="0.01" value={currentProduct.price} onChange={handleModalInputChange} className="p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={closeEditModal} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={closeDeleteModal} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
              <button type="button" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

