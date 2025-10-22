import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adService, reviewService, messageService } from '../services/api';
import toast from 'react-hot-toast';

const AdDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [ad, setAd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchAd();
    fetchReviews();
  }, [id]);

  const fetchAd = async () => {
    try {
      const response = await adService.getById(id);
      setAd(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      toast.error('Annonce non trouvée');
      navigate('/ads');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getByAd(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour envoyer un message');
      navigate('/login');
      return;
    }

    try {
      await messageService.startConversation(id, message);
      toast.success('Message envoyé !');
      setMessage('');
      navigate('/messages');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleReport = async () => {
    try {
      await adService.report(id, reportReason);
      toast.success('Annonce signalée avec succès');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      toast.error('Erreur lors du signalement');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="bg-gray-300 dark:bg-gray-700 h-96 rounded-lg mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Annonce non trouvée
        </p>
        <Link to="/ads" className="text-blue-600 dark:text-blue-400 hover:underline">
          Retour aux annonces
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/ads" className="text-blue-600 dark:text-blue-400 hover:underline">
          Annonces
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-500">{ad.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images et description */}
        <div className="lg:col-span-2">
          {/* Galerie d'images */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            {ad.images && ad.images.length > 0 ? (
              <>
                <div className="mb-4">
                  <img
                    src={`http://localhost:5000/uploads/${ad.images[activeImage]}`}
                    alt={ad.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                {ad.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {ad.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`border-2 rounded-lg overflow-hidden ${
                          activeImage === index ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={`http://localhost:5000/uploads/${image}`}
                          alt={`${ad.title} ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-400">Pas d'image</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {ad.description}
            </p>
          </div>

          {/* Avis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Avis ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {review.user.username}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Aucun avis pour le moment.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Infos prix et vendeur */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {ad.title}
            </h1>
            
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {ad.price.toLocaleString()} €
              {ad.isNegotiable && (
                <span className="text-sm text-green-600 ml-2">(Négociable)</span>
              )}
            </p>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>Catégorie: <span className="capitalize">{ad.category}</span></p>
              <p>Localisation: {ad.location}</p>
              <p>État: {ad.condition}</p>
              <p>Vues: {ad.views}</p>
              <p>Publié le: {new Date(ad.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              {isAuthenticated && ad.user._id !== user?.id && (
                <>
                  <button
                    onClick={() => document.getElementById('message_modal').showModal()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Contacter le vendeur
                  </button>
                  
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Signaler cette annonce
                  </button>
                </>
              )}

              {isAuthenticated && ad.user._id === user?.id && (
                <Link
                  to="/dashboard"
                  className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Gérer mon annonce
                </Link>
              )}
            </div>
          </div>

          {/* Infos vendeur */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Vendeur
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                  {ad.user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {ad.user.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {ad.user.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de message */}
      <dialog id="message_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Contacter le vendeur</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour, je suis intéressé par votre annonce..."
            className="textarea textarea-bordered w-full h-32 mb-4"
          />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Annuler</button>
              <button 
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Modal de signalement */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="font-bold text-lg mb-4">Signaler cette annonce</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Pourquoi signalez-vous cette annonce ?"
              className="textarea textarea-bordered w-full h-32 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="btn btn-error"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetail;