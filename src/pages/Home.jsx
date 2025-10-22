import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adService } from '../services/api';

const Home = () => {
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'immobilier', name: 'Immobilier', icon: '🏠' },
    { id: 'vehicules', name: 'Véhicules', icon: '🚗' },
    { id: 'multimedia', name: 'Multimédia', icon: '💻' },
    { id: 'emploi', name: 'Emploi', icon: '💼' },
    { id: 'maison', name: 'Maison', icon: '🛋️' },
    { id: 'loisirs', name: 'Loisirs', icon: '🎮' },
    { id: 'autres', name: 'Autres', icon: '📦' },
  ];

  useEffect(() => {
    fetchFeaturedAds();
  }, []);

  const fetchFeaturedAds = async () => {
    try {
      const response = await adService.getAll({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' });
      setFeaturedAds(response.data.ads);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Rediriger vers la page des annonces avec les critères de recherche
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    
    window.location.href = `/ads?${params.toString()}`;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Trouvez la bonne affaire
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Des milliers d'annonces près de chez vous
        </p>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Que cherchez-vous ?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </section>

      {/* Catégories */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Parcourir par catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/ads?category=${category.id}`}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Annonces récentes */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Annonces récentes
          </h2>
          <Link 
            to="/ads" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map(ad => (
              <Link
                key={ad._id}
                to={`/ads/${ad._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  {ad.images && ad.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/uploads/${ad.images[0]}`}
                      alt={ad.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400">
                      <span>Pas d'image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {ad.price.toLocaleString()} €
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>{ad.location}</span>
                    <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
          Vous avez quelque chose à vendre ?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Rejoignez des milliers de vendeurs et commencez à vendre dès aujourd'hui
        </p>
        <Link
          to="/create-ad"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
        >
          Déposer une annonce gratuite
        </Link>
      </section>
    </div>
  );
};

export default Home;
