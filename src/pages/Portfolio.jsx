import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PortfolioForm from '../components/Portfolio/PortfolioForm';
import PortfolioList from '../components/Portfolio/PortfolioList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Portfolio = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'portfolio', itemId));
      toast.success('Portfolio item deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Failed to delete portfolio item');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Item
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <PortfolioForm
            editingItem={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}

      <PortfolioList onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default Portfolio; 