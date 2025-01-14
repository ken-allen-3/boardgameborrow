import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onChange, 
  readonly = false,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleMouseEnter = (star: number) => {
    if (!readonly) {
      setHoverRating(star);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const handleClick = (star: number) => {
    if (!readonly && onChange) {
      // If clicking the same star twice, clear the rating
      onChange(star === rating ? 0 : star);
    }
  };

  const getStarFill = (star: number) => {
    const currentRating = isHovering ? hoverRating : rating;
    return star <= currentRating;
  };

  return (
    <div 
      className="flex items-center gap-1" 
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
            transition-transform duration-100`}
          disabled={readonly}
          title={readonly ? `${rating} stars` : `Rate ${star} stars`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              getStarFill(star)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } transition-colors duration-100`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
