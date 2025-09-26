import React, { useState, useEffect } from 'react';
import config from '../constants.js';

const DashboardPage = ({ user, onLogout, manifest }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', description: '', address: '', cuisine: '' });
  const [heroImage, setHeroImage] = useState(null);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const response = await manifest.from('Restaurant').find({ 
        include: ['owner'], 
        sort: { createdAt: 'desc' } 
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newRestaurant, owner: user.id };
      if (heroImage) {
        payload.heroImage = heroImage;
      }
      await manifest.from('Restaurant').create(payload);
      setNewRestaurant({ name: '', description: '', address: '', cuisine: '' });
      setHeroImage(null);
      e.target.reset(); // Reset file input
      loadRestaurants(); // Refresh the list
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">FoodApp Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}!</span>
            <a href={`${config.BACKEND_URL}/admin`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300">Admin</a>
            <button onClick={onLogout} className="text-sm font-medium bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a New Restaurant</h2>
          <form onSubmit={handleCreateRestaurant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Restaurant Name" value={newRestaurant.name} onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" placeholder="Cuisine Type (e.g., Italian)" value={newRestaurant.cuisine} onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <textarea placeholder="Description" value={newRestaurant.description} onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })} required className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
            <input type="text" placeholder="Address" value={newRestaurant.address} onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })} required className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
              <input type="file" onChange={(e) => setHeroImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
            <button type="submit" className="md:col-span-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200">Add Restaurant</button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurants</h2>
          {isLoading ? (
            <p>Loading restaurants...</p>
          ) : restaurants.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No restaurants found. Add one above to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(resto => (
                <div key={resto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <img src={resto.heroImage?.thumbnail || 'https://via.placeholder.com/400x300'} alt={resto.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{resto.name}</h3>
                    <p className="text-sm text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded-full my-2">{resto.cuisine}</p>
                    <p className="text-sm text-gray-600 mt-1 truncate">{resto.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Owner: {resto.owner?.name || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
