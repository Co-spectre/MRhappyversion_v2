import React, { useState } from 'react';
import { ChefHat, Award, Star, Clock, MapPin, Users, Utensils } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Chef {
  id: string;
  name: string;
  title: string;
  restaurant: string;
  image: string;
  coverImage: string;
  specialties: string[];
  experience: string;
  achievements: string[];
  signature_dishes: string[];
  philosophy: string;
  background: string;
  social: {
    instagram?: string;
    twitter?: string;
  };
  stats: {
    dishes_created: number;
    awards: number;
    years_experience: number;
    customers_served: string;
  };
}

const ChefShowcasePage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);

  const chefs: Chef[] = [
    {
      id: 'mehmet',
      name: 'Chef Mehmet Özkan',
      title: 'Master of Turkish Cuisine',
      restaurant: 'Mr.Happy Doner',
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
      coverImage: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200',
      specialties: ['Traditional Döner', 'Turkish Pide', 'Mediterranean Mezze', 'Baklava'],
      experience: '25+ Years',
      achievements: [
        'Istanbul Culinary Institute Graduate',
        'Turkish Restaurant Association Award Winner',
        'Featured in National Geographic Food',
        'Master of Traditional Döner Techniques'
      ],
      signature_dishes: [
        'Iskender Döner with Homemade Yogurt',
        'Lamb Döner with Turkish Spices',
        'Traditional Turkish Breakfast Platter',
        'Honey-Soaked Baklava'
      ],
      philosophy: 'Food is a bridge between cultures. Every döner I make carries the soul of Turkey and brings families together around the table.',
      background: 'Born in Istanbul, Chef Mehmet learned the art of döner making from his grandfather who owned one of the oldest döner shops in the Grand Bazaar. He spent years perfecting traditional recipes before bringing authentic Turkish flavors to international kitchens.',
      social: {
        instagram: '@chef_mehmet_doner',
        twitter: '@MehmetOzkanChef'
      },
      stats: {
        dishes_created: 150,
        awards: 8,
        years_experience: 25,
        customers_served: '50K+'
      }
    },
    {
      id: 'marcus',
      name: 'Chef Marcus Johnson',
      title: 'Burger Innovation Master',
      restaurant: 'Mr.Happy Burger',
      image: 'https://images.pexels.com/photos/2102934/pexels-photo-2102934.jpeg?auto=compress&cs=tinysrgb&w=800',
      coverImage: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=1200',
      specialties: ['Gourmet Burgers', 'Artisan Buns', 'Premium Beef Blends', 'Creative Toppings'],
      experience: '15+ Years',
      achievements: [
        'Culinary Institute of America Graduate',
        'James Beard Award Nominee',
        'Winner of National Burger Championship',
        'Featured in Food & Wine Magazine'
      ],
      signature_dishes: [
        'The Marcus: Wagyu Beef with Truffle Aioli',
        'BBQ Bourbon Burger with Bacon Jam',
        'Mushroom Swiss with Caramelized Onions',
        'Spicy Jalapeño Pepper Jack Burger'
      ],
      philosophy: 'A burger is more than fast food - it\'s comfort, nostalgia, and perfection between two buns. Every bite should tell a story.',
      background: 'Former sous chef at multiple Michelin-starred restaurants, Marcus decided to elevate the humble burger by applying fine dining techniques to create extraordinary flavor combinations and premium ingredients.',
      social: {
        instagram: '@chef_marcus_burgers',
        twitter: '@MarcusJohnsonChef'
      },
      stats: {
        dishes_created: 200,
        awards: 12,
        years_experience: 15,
        customers_served: '75K+'
      }
    },
    {
      id: 'maria',
      name: 'Chef Maria Rodriguez',
      title: 'International Cuisine Artist',
      restaurant: 'Mr.Happy Restaurant',
      image: 'https://images.pexels.com/photos/2102933/pexels-photo-2102933.jpeg?auto=compress&cs=tinysrgb&w=800',
      coverImage: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
      specialties: ['Fine Dining', 'Molecular Gastronomy', 'Seasonal Menus', 'Wine Pairings'],
      experience: '20+ Years',
      achievements: [
        'Le Cordon Bleu Paris Graduate',
        'Michelin Star Recipient',
        'World Culinary Championship Winner',
        'James Beard Outstanding Chef Award'
      ],
      signature_dishes: [
        'Deconstructed Beef Wellington',
        'Sea Bass with Saffron Foam',
        'Chocolate Soufflé with Gold Leaf',
        'Lobster Thermidor Modern'
      ],
      philosophy: 'Cooking is painting with flavors. Each dish is a canvas where technique meets creativity to create unforgettable experiences.',
      background: 'Trained in the finest kitchens of Paris and New York, Chef Maria brings international flair and innovative techniques to create dishes that surprise and delight. Her seasonal menus reflect her commitment to fresh, local ingredients.',
      social: {
        instagram: '@chef_maria_finedining',
        twitter: '@MariaRodriguezChef'
      },
      stats: {
        dishes_created: 300,
        awards: 15,
        years_experience: 20,
        customers_served: '25K+'
      }
    }
  ];

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="w-16 h-16 text-red-500 mr-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Meet Our <span className="text-red-500">Chefs</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            World-class culinary artists crafting exceptional dining experiences with passion, creativity, and years of expertise
          </p>
        </div>
      </section>

      {/* Chef Cards Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chefs.map((chef) => (
              <div 
                key={chef.id}
                className="group cursor-pointer bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                onClick={() => setSelectedChef(chef)}
              >
                {/* Chef Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={chef.image} 
                    alt={chef.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ChefHat className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">{chef.restaurant}</span>
                    </div>
                  </div>
                </div>

                {/* Chef Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {chef.name}
                  </h3>
                  <p className="text-red-400 font-medium mb-4">{chef.title}</p>
                  
                  {/* Experience & Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{chef.experience}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Award className="w-4 h-4" />
                      <span>{chef.stats.awards} Awards</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chef.specialties.slice(0, 2).map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {chef.specialties.length > 2 && (
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
                        +{chef.specialties.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors group-hover:shadow-lg hover:shadow-red-500/30">
                    View Chef Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Detail Modal */}
      {selectedChef && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Header with Cover Image */}
              <div className="relative h-80">
                <img 
                  src={selectedChef.coverImage}
                  alt={selectedChef.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedChef(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-red-400 transition-colors"
                >
                  ×
                </button>

                {/* Chef Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end space-x-6">
                    <img 
                      src={selectedChef.image}
                      alt={selectedChef.name}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
                    />
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedChef.name}</h2>
                      <p className="text-red-400 text-lg font-medium mb-2">{selectedChef.title}</p>
                      <div className="flex items-center space-x-4 text-gray-300 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedChef.restaurant}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedChef.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Utensils className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedChef.stats.dishes_created}</div>
                    <div className="text-gray-400 text-sm">Signature Dishes</div>
                  </div>
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedChef.stats.awards}</div>
                    <div className="text-gray-400 text-sm">Awards Won</div>
                  </div>
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedChef.stats.years_experience}</div>
                    <div className="text-gray-400 text-sm">Years Experience</div>
                  </div>
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedChef.stats.customers_served}</div>
                    <div className="text-gray-400 text-sm">Happy Customers</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Philosophy */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Culinary Philosophy</h3>
                      <p className="text-gray-300 leading-relaxed italic">
                        "{selectedChef.philosophy}"
                      </p>
                    </div>

                    {/* Background */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Background</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {selectedChef.background}
                      </p>
                    </div>

                    {/* Specialties */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedChef.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Achievements */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Achievements</h3>
                      <ul className="space-y-2">
                        {selectedChef.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-2 text-gray-300">
                            <Award className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Signature Dishes */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Signature Dishes</h3>
                      <ul className="space-y-2">
                        {selectedChef.signature_dishes.map((dish, index) => (
                          <li key={index} className="flex items-start space-x-2 text-gray-300">
                            <Star className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                            <span>{dish}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors">
                    View {selectedChef.restaurant} Menu
                  </button>
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
                    Follow Chef
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

export default ChefShowcasePage;
