import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Thermometer, Users, Camera, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LiveStream {
  id: string;
  restaurant: string;
  chef: string;
  title: string;
  viewers: number;
  isLive: boolean;
  thumbnail: string;
  duration?: string;
}

interface KitchenProcess {
  id: string;
  step: string;
  description: string;
  time: string;
  temperature?: string;
  image: string;
  chef: string;
}

const KitchenLivePage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const liveStreams: LiveStream[] = [
    {
      id: 'doner-kitchen',
      restaurant: 'Mr.Happy Doner',
      chef: 'Chef Mehmet',
      title: 'Traditional Döner Preparation - Live',
      viewers: 1247,
      isLive: true,
      thumbnail: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'burger-grill',
      restaurant: 'Mr.Happy Burger',
      chef: 'Chef Marcus',
      title: 'Burger Masterclass - Wagyu Special',
      viewers: 892,
      isLive: true,
      thumbnail: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'fine-dining',
      restaurant: 'Mr.Happy Restaurant',
      chef: 'Chef Maria',
      title: 'Molecular Gastronomy Workshop',
      viewers: 645,
      isLive: false,
      thumbnail: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '45:32'
    }
  ];

  const kitchenProcesses: KitchenProcess[] = [
    {
      id: 'doner-prep',
      step: '1. Meat Preparation',
      description: 'Marinating lamb and chicken with traditional Turkish spices for 24 hours',
      time: '24 hours',
      temperature: '4°C',
      image: 'https://images.pexels.com/photos/4518665/pexels-photo-4518665.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'Chef Mehmet'
    },
    {
      id: 'doner-stack',
      step: '2. Döner Stacking',
      description: 'Carefully layering seasoned meat on vertical rotisserie in traditional pattern',
      time: '2 hours',
      temperature: '180°C',
      image: 'https://images.pexels.com/photos/4393019/pexels-photo-4393019.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'Chef Mehmet'
    },
    {
      id: 'burger-blend',
      step: '3. Beef Blending',
      description: 'Creating custom beef blends with chuck, brisket, and short rib for optimal flavor',
      time: '30 minutes',
      image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'Chef Marcus'
    },
    {
      id: 'sauce-making',
      step: '4. Sauce Creation',
      description: 'Hand-crafting signature sauces and aiolis with fresh herbs and premium ingredients',
      time: '1 hour',
      image: 'https://images.pexels.com/photos/4518671/pexels-photo-4518671.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'Chef Maria'
    },
    {
      id: 'plating',
      step: '5. Artistic Plating',
      description: 'Precision plating with artistic presentation and garnish placement',
      time: '5 minutes',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'Chef Maria'
    },
    {
      id: 'quality-check',
      step: '6. Quality Control',
      description: 'Final temperature check and taste testing before service',
      time: '2 minutes',
      temperature: '65°C',
      image: 'https://images.pexels.com/photos/3184188/pexels-photo-3184188.jpeg?auto=compress&cs=tinysrgb&w=800',
      chef: 'All Chefs'
    }
  ];

  // Simulate live stream updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Camera className="w-16 h-16 text-red-500 mr-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Kitchen <span className="text-red-500">Live</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Go behind the scenes and watch our master chefs create culinary magic in real-time
          </p>
        </div>
      </section>

      {/* Live Streams Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Live Kitchen Streams
            </h2>
            <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">LIVE NOW</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveStreams.map((stream) => (
              <div 
                key={stream.id}
                className="group cursor-pointer bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                onClick={() => setSelectedStream(stream)}
              >
                {/* Stream Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={stream.thumbnail} 
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Live Badge */}
                  {stream.isLive && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  )}

                  {/* Duration for recorded videos */}
                  {!stream.isLive && stream.duration && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {stream.duration}
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-red-500/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-1">
                        <ChefHat className="w-4 h-4" />
                        <span>{stream.chef}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{stream.viewers.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{stream.restaurant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kitchen Process Timeline */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Kitchen Process Timeline
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Follow the step-by-step process of how our dishes come to life
            </p>
          </div>

          <div className="space-y-8">
            {kitchenProcesses.map((process, index) => (
              <div key={process.id} className="flex items-center group">
                {/* Timeline Line */}
                <div className="hidden md:flex flex-col items-center mr-8">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  {index < kitchenProcesses.length - 1 && (
                    <div className="w-1 h-20 bg-gradient-to-b from-red-500 to-gray-700 mt-4"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 group-hover:border-red-500 transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-1/3">
                      <img 
                        src={process.image}
                        alt={process.step}
                        className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="md:w-2/3 p-6">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                        {process.step}
                      </h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {process.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">{process.time}</span>
                        </div>
                        {process.temperature && (
                          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300">{process.temperature}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                          <ChefHat className="w-4 h-4 text-red-400" />
                          <span className="text-gray-300">{process.chef}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stream Modal */}
      {selectedStream && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <img 
                  src={selectedStream.thumbnail}
                  alt={selectedStream.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? 
                      <Pause className="w-10 h-10 text-white" /> : 
                      <Play className="w-10 h-10 text-white ml-1" />
                    }
                  </button>
                </div>

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4 text-white">
                    <button onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? 
                        <Pause className="w-5 h-5" /> : 
                        <Play className="w-5 h-5" />
                      }
                    </button>
                    
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-2 bg-gray-600 rounded-full">
                        <div className="h-full bg-red-500 rounded-full w-1/3"></div>
                      </div>
                      <span className="text-sm">
                        {selectedStream.isLive ? 'LIVE' : selectedStream.duration}
                      </span>
                    </div>

                    <button onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? 
                        <VolumeX className="w-5 h-5" /> : 
                        <Volume2 className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedStream(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-red-400 transition-colors"
                >
                  ×
                </button>

                {/* Live Badge */}
                {selectedStream.isLive && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedStream.title}</h2>
                    <p className="text-gray-400">{selectedStream.restaurant} • {selectedStream.chef}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Users className="w-5 h-5" />
                    <span>{selectedStream.viewers.toLocaleString()} watching</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Follow Chef
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Save Stream
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

export default KitchenLivePage;
