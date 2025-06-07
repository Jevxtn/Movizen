// src/components/MovieList.tsx
import Image from 'next/image';
import { Movie } from '@/types';

interface MovieListProps {
  movies: Movie[];
  onRemoveMovie?: (id: string) => void; // Function to remove a movie
}

export const MovieList = ({ movies, onRemoveMovie }: MovieListProps) => {
  if (movies.length === 0) {
    return <p className="text-center text-gray-600 dark:text-gray-400 py-8">No movies in your watchlist yet. Add some!</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">      {movies.map((movie) => (
        <div 
          key={movie.id} 
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-xl"
        >
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">            {movie.posterUrl ? (
              <Image 
                src={movie.posterUrl} 
                alt={movie.title}
                width={200}
                height={300}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 4h6M5 8h14M5 12h14M5 16h14" />
                  </svg>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">No Poster</p>
                </div>
              </div>
            )}
              {/* Year Badge */}
            {movie.year && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-xs font-medium">
                {movie.year}
              </div>
            )}
            
            {/* Delete Button */}
            {onRemoveMovie && (
              <button
                onClick={() => onRemoveMovie(movie.id)}
                className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                title="Remove movie"
                aria-label="Remove movie"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Movie Information */}
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {movie.title}
            </h3>
            
            {/* Release Date */}
            <div className="flex items-center mb-2">
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {movie.releaseDate.toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Director */}
            {movie.director && (
              <div className="flex items-center mb-2">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {movie.director}
                </p>
              </div>
            )}

            {/* Genre */}
            {movie.genre && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {movie.genre.split(',').slice(0, 2).map((genre, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                  {movie.genre.split(',').length > 2 && (
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-xs">
                      +{movie.genre.split(',').length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Plot/Description */}
            {(movie.plot || movie.description) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                {movie.plot || movie.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
