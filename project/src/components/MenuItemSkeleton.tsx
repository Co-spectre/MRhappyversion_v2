import React from 'react';

const MenuItemSkeleton: React.FC = () => {
  return (
    <div className="bg-black border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-800"></div>
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-800 rounded w-16 ml-4"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        </div>
        
        {/* Tags */}
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-800 rounded-full w-16"></div>
          <div className="h-6 bg-gray-800 rounded-full w-20"></div>
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
};

export default MenuItemSkeleton;
