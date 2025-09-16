import React, { useState } from 'react';
import { ChefHat, Clock, Users, Star, BookOpen, Download, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Recipe {
  id: string;
  title: string;
  chef: string;
  restaurant: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: string;
  servings: number;
  rating: number;
  image: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  category: string;
  isSignature: boolean;
  downloadable: boolean;
}

const ChefRecipesPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recipes: Recipe[] = [
    {
      id: 'authentic-doner',
      title: 'Authentic Turkish Döner',
      chef: 'Chef Mehmet Özkan',
      restaurant: 'Mr.Happy Doner',
      difficulty: 'Hard',
      cookTime: '24 hours',
      servings: 8,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Traditional Turkish döner recipe passed down through generations, featuring perfectly spiced lamb and chicken.',
      ingredients: [
        '2 kg lamb shoulder, thinly sliced',
        '1 kg chicken thigh, thinly sliced',
        '3 tbsp Turkish red pepper paste',
        '2 tbsp olive oil',
        '1 tbsp ground cumin',
        '1 tbsp paprika',
        '1 tsp cinnamon',
        '1 tsp black pepper',
        '2 tsp salt',
        '4 cloves garlic, minced',
        '1 large onion, grated',
        'Fresh pita bread',
        'Yogurt sauce',
        'Pickled vegetables'
      ],
      instructions: [
        'Mix all spices with olive oil, garlic, and grated onion to create marinade',
        'Marinate lamb and chicken separately for 24 hours in refrigerator',
        'Layer meat alternately on vertical rotisserie skewer',
        'Cook on rotisserie at 180°C for 3-4 hours, turning regularly',
        'Slice meat thinly from outside as it cooks',
        'Serve immediately with warm pita, yogurt sauce, and vegetables'
      ],
      tips: [
        'The key is in the 24-hour marinade - never rush this step',
        'Layer lean and fatty cuts for perfect texture',
        'Keep the meat moist by basting with its own juices'
      ],
      category: 'Turkish',
      isSignature: true,
      downloadable: true
    },
    {
      id: 'wagyu-burger',
      title: 'Signature Wagyu Burger',
      chef: 'Chef Marcus Johnson',
      restaurant: 'Mr.Happy Burger',
      difficulty: 'Medium',
      cookTime: '45 minutes',
      servings: 4,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Premium Wagyu beef burger with truffle aioli and artisan bun, representing the pinnacle of burger craft.',
      ingredients: [
        '800g Wagyu ground beef (80/20 ratio)',
        '4 artisan brioche buns',
        '4 slices aged cheddar',
        '200ml truffle aioli',
        '4 butter lettuce leaves',
        '2 large tomatoes, sliced',
        '1 red onion, caramelized',
        '8 strips bacon',
        'Sea salt and black pepper'
      ],
      instructions: [
        'Form beef into 200g patties, season with salt and pepper',
        'Heat grill to high temperature',
        'Cook patties for 3-4 minutes per side for medium-rare',
        'Toast buns lightly on the grill',
        'Layer with truffle aioli, lettuce, patty, cheese, tomato, caramelized onion, and bacon',
        'Serve immediately with hand-cut fries'
      ],
      tips: [
        'Never press down on the patties while cooking',
        'Let meat rest at room temperature for 30 minutes before cooking',
        'The secret is in the high-quality beef - never compromise'
      ],
      category: 'American',
      isSignature: true,
      downloadable: true
    },
    {
      id: 'molecular-dessert',
      title: 'Chocolate Sphere with Gold',
      chef: 'Chef Maria Rodriguez',
      restaurant: 'Mr.Happy Restaurant',
      difficulty: 'Hard',
      cookTime: '3 hours',
      servings: 6,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Molecular gastronomy dessert featuring chocolate sphere that melts to reveal hidden surprises inside.',
      ingredients: [
        '400g dark chocolate (70%)',
        '200ml heavy cream',
        '100g sugar',
        '50ml Grand Marnier',
        '200g fresh berries',
        '100ml raspberry coulis',
        'Edible gold leaf',
        'Liquid nitrogen (optional)',
        'Sphere molds'
      ],
      instructions: [
        'Temper chocolate to create perfect spheres using molds',
        'Create ganache with cream, sugar, and Grand Marnier',
        'Fill spheres with ganache and fresh berries',
        'Seal spheres with tempered chocolate',
        'Plate with raspberry coulis and gold leaf',
        'Serve with warm sauce to melt sphere at table'
      ],
      tips: [
        'Temperature control is crucial for chocolate tempering',
        'Practice the sphere technique before attempting for guests',
        'The theatrical presentation is half the experience'
      ],
      category: 'Dessert',
      isSignature: true,
      downloadable: false
    },
    {
      id: 'homemade-pita',
      title: 'Traditional Turkish Pita',
      chef: 'Chef Mehmet Özkan',
      restaurant: 'Mr.Happy Doner',
      difficulty: 'Easy',
      cookTime: '2 hours',
      servings: 12,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/4518671/pexels-photo-4518671.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Soft, fluffy Turkish pita bread perfect for döner or enjoyed on its own.',
      ingredients: [
        '500g bread flour',
        '300ml warm water',
        '7g active dry yeast',
        '1 tsp sugar',
        '1 tsp salt',
        '2 tbsp olive oil',
        'Sesame seeds for topping'
      ],
      instructions: [
        'Dissolve yeast and sugar in warm water, let bloom for 5 minutes',
        'Mix flour and salt in large bowl',
        'Add yeast mixture and olive oil, knead for 10 minutes',
        'Let rise for 1 hour until doubled',
        'Divide into 12 portions, roll thin',
        'Bake at 220°C for 8-10 minutes until golden'
      ],
      tips: [
        'Water temperature should be around 37°C for optimal yeast activation',
        'Don\'t over-flour the surface when rolling',
        'Serve warm for best texture'
      ],
      category: 'Bread',
      isSignature: false,
      downloadable: true
    }
  ];

  const categories = ['all', 'Turkish', 'American', 'Dessert', 'Bread'];

  const filteredRecipes = selectedCategory === 'all' 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-16 h-16 text-red-500 mr-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Chef <span className="text-red-500">Recipes</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Master the signature dishes from our world-class chefs with these detailed recipes and cooking techniques
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                className="group cursor-pointer bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {/* Recipe Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Signature Badge */}
                  {recipe.isSignature && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>SIGNATURE</span>
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-red-400 text-sm font-medium mb-2">{recipe.chef}</p>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{recipe.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        <Heart className="w-4 h-4 text-gray-300 hover:text-red-400" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-gray-300 hover:text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="relative h-80">
                <img 
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-red-400 transition-colors text-xl"
                >
                  ×
                </button>

                {/* Recipe Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedRecipe.title}</h2>
                  <p className="text-red-400 text-lg font-medium mb-4">{selectedRecipe.chef} • {selectedRecipe.restaurant}</p>
                  <div className="flex items-center space-x-6 text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-5 h-5" />
                      <span>{selectedRecipe.cookTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-5 h-5" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span>{selectedRecipe.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Description */}
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {selectedRecipe.description}
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Ingredients */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Ingredients</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-300">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Instructions</h3>
                    <ol className="space-y-3">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3 text-gray-300">
                          <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                            {index + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Chef Tips */}
                <div className="mt-8 bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <ChefHat className="w-5 h-5 text-red-500" />
                    <span>Chef's Tips</span>
                  </h3>
                  <ul className="space-y-2">
                    {selectedRecipe.tips.map((tip, index) => (
                      <li key={index} className="text-gray-300 italic">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  {selectedRecipe.downloadable && (
                    <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Download Recipe PDF</span>
                    </button>
                  )}
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Save to Favorites</span>
                  </button>
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Share Recipe</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefRecipesPage;
