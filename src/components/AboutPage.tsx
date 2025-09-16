import React from 'react';
import { Heart, Award, Users, Clock, Leaf, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  
  const values = [
    {
      icon: Heart,
      title: 'Passion for Food',
      description: 'Every dish is crafted with love and attention to detail, using only the finest ingredients.'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We maintain the highest standards in food preparation, service, and customer satisfaction.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building lasting relationships with our customers and supporting our local community.'
    },
    {
      icon: Clock,
      title: 'Fresh Daily',
      description: 'All ingredients are sourced fresh daily to ensure maximum flavor and nutritional value.'
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'Committed to environmentally responsible sourcing and eco-friendly packaging.'
    },
    {
      icon: Shield,
      title: 'Food Safety',
      description: 'Rigorous food safety protocols and regular health inspections ensure your peace of mind.'
    }
  ];

  const restaurants = [
    {
      name: 'Mr.Happy Doner',
      image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Authentic Turkish and Mediterranean cuisine featuring traditional döner kebabs, fresh pita bread, and homemade sauces. Our master chefs bring generations of Turkish culinary expertise to every dish.',
      specialties: ['Traditional Döner Kebab', 'Fresh Pita Bread', 'Homemade Sauces', 'Mediterranean Salads'],
      story: 'Founded by Chef Mehmet, who learned the art of döner making from his grandfather in Istanbul. Every recipe is a family tradition passed down through generations.'
    },
    {
      name: 'Mr.Happy Burger',
      image: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Premium American-style burgers made with locally sourced beef, artisan buns, and creative toppings. We elevate the classic burger experience with gourmet ingredients and bold flavors.',
      specialties: ['Signature Beef Blends', 'Artisan Buns', 'Creative Toppings', 'Hand-Cut Fries'],
      story: 'Born from a passion for the perfect burger, our chefs spent years perfecting the ideal beef blend and cooking techniques to create the ultimate burger experience.'
    },
    {
      name: 'Mr.Happy Restaurant',
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Fine dining experience featuring international cuisine with seasonal menus. Our culinary team creates innovative dishes that blend traditional techniques with modern presentation.',
      specialties: ['Seasonal Menus', 'Wine Pairings', 'Chef Specials', 'Artisan Desserts'],
      story: 'Led by Executive Chef Maria, our fine dining concept showcases culinary artistry with dishes that tell a story and create memorable dining experiences.'
    }
  ];

  const team = [
    {
      name: 'Chef Mehmet Özkan',
      role: 'Head Chef - Mr.Happy Doner',
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: '25+ years of Turkish culinary expertise, trained in Istanbul\'s finest restaurants.'
    },
    {
      name: 'Chef Marcus Johnson',
      role: 'Head Chef - Mr.Happy Burger',
      image: 'https://images.pexels.com/photos/2102934/pexels-photo-2102934.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Former sous chef at Michelin-starred restaurants, specializing in elevated comfort food.'
    },
    {
      name: 'Chef Maria Rodriguez',
      role: 'Executive Chef - Mr.Happy Restaurant',
      image: 'https://images.pexels.com/photos/2102933/pexels-photo-2102933.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Culinary Institute graduate with expertise in international cuisine and innovative techniques.'
    }
  ];

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">{t('about.story.title')}</h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  {t('about.story.text')}
                </p>
                <p>
                  Our journey is rooted in the belief that great food has the power to create happiness, 
                  build communities, and preserve cultural traditions. From our authentic Turkish döner 
                  to our gourmet burgers and fine dining experiences, every dish tells a story.
                </p>
                <p>
                  Today, we're proud to serve thousands of happy customers who have become part of our 
                  extended family. Our commitment to quality, authenticity, and innovation continues to 
                  drive everything we do.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Restaurant kitchen"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do, from sourcing ingredients to serving customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-600/10 rounded-lg mr-4">
                    <value.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Restaurants */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Restaurant Concepts</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three distinct culinary experiences, each with its own personality and specialties
            </p>
          </div>

          <div className="space-y-16">
            {restaurants.map((restaurant, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="rounded-xl shadow-2xl w-full h-80 object-cover"
                  />
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <h3 className="text-3xl font-bold text-white mb-4">{restaurant.name}</h3>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {restaurant.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-600/10 text-red-400 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300 italic">"{restaurant.story}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Culinary Team</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The talented chefs and culinary artists behind our exceptional dining experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 object-cover rounded-full mx-auto shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-red-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join the Mr.Happy Family</h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Experience the difference that passion, quality, and dedication make. 
            We can't wait to serve you and create your next happy moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25">
              Order Now
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border border-gray-700 hover:border-gray-600">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;