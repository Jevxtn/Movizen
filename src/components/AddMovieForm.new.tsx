"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Movie, OMDbMovie } from '@/types';
import { searchMovies, getMovieDetails } from '@/services/omdbApi';

interface AddMovieFormProps {
  onAddMovie: (movie: Omit<Movie, 'id'>) => void;
}

const AddMovieForm = ({ onAddMovie }: AddMovieFormProps) => {
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [useDatePicker, setUseDatePicker] = useState(true);
  const [searchResults, setSearchResults] = useState<OMDbMovie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<OMDbMovie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search movies when title changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (title.length >= 3 && !selectedMovie) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchMovies(title);
        setSearchResults(results);
        setShowResults(results.length > 0);
        setIsLoading(false);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [title, selectedMovie]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMovieSelect = async (movie: OMDbMovie) => {
    setSelectedMovie(movie);
    setTitle(movie.Title);
    setShowResults(false);
    
    // Get detailed movie information
    const details = await getMovieDetails(movie.imdbID);
    if (details && details.Released) {
      // Try to parse the release date from OMDb
      const releaseDate = new Date(details.Released);
      if (!isNaN(releaseDate.getTime())) {
        const year = releaseDate.getFullYear();
        const month = String(releaseDate.getMonth() + 1).padStart(2, '0');
        const day = String(releaseDate.getDate()).padStart(2, '0');
        setReleaseDate(`${year}-${month}-${day}`);
      }
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (selectedMovie && value !== selectedMovie.Title) {
      setSelectedMovie(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !releaseDate) {
      alert('Title and Release Date are required.');
      return;
    }

    let dateToUse: Date;
    
    if (useDatePicker) {
      // Date picker returns YYYY-MM-DD format
      dateToUse = new Date(releaseDate);
    } else {
      // Manual input validation for various date formats
      if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate) && 
          !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(releaseDate) &&
          !/^\d{1,2}-\d{1,2}-\d{4}$/.test(releaseDate)) {
        alert('Please enter the release date in YYYY-MM-DD, MM/DD/YYYY, or MM-DD-YYYY format.');
        return;
      }
      dateToUse = new Date(releaseDate);
    }

    // Validate that the date is valid
    if (isNaN(dateToUse.getTime())) {
      alert('Please enter a valid date.');
      return;
    }

    // Get full movie details if a movie was selected
    let movieDetails: OMDbMovie | null = null;
    if (selectedMovie) {
      movieDetails = await getMovieDetails(selectedMovie.imdbID);
    }

    const newMovie: Omit<Movie, 'id'> = {
      title,
      releaseDate: dateToUse,
      posterUrl: movieDetails?.Poster || selectedMovie?.Poster || '',
      description: movieDetails?.Plot || '',
      imdbID: movieDetails?.imdbID || selectedMovie?.imdbID || '',
      year: movieDetails?.Year || selectedMovie?.Year || '',
      director: movieDetails?.Director || '',
      genre: movieDetails?.Genre || '',
      plot: movieDetails?.Plot || '',
    };

    onAddMovie(newMovie);
    setTitle('');
    setReleaseDate('');
    setSelectedMovie(null);
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <form onSubmit={handleSubmit} className="my-8 p-6 border rounded-lg shadow-xl bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Add New Movie</h2>
      <div className="grid grid-cols-1 gap-6">
        {/* Movie Title with Search */}
        <div className="relative">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Movie Title
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={(e) => {
                handleTitleChange(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(searchResults.length > 0)}
              required
              placeholder="Start typing a movie title..."
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div 
              ref={resultsRef}
              className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto"
            >
              {searchResults.map((movie) => (
                <div
                  key={movie.imdbID}
                  onClick={() => handleMovieSelect(movie)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-3"
                >
                  {movie.Poster && (
                    <Image 
                      src={movie.Poster} 
                      alt={movie.Title}
                      width={40}
                      height={56}
                      className="w-10 h-14 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{movie.Title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">({movie.Year})</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Release Date */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Release Date
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {useDatePicker ? 'Calendar' : 'Manual'}
              </span>
              <button
                type="button"
                onClick={() => {
                  const currentMode = useDatePicker;
                  setUseDatePicker(!useDatePicker);
                  
                  // When switching from manual to date picker, try to convert the date
                  if (!currentMode && releaseDate) {
                    const dateObj = new Date(releaseDate);
                    if (!isNaN(dateObj.getTime())) {
                      // Convert to YYYY-MM-DD format for date input
                      const year = dateObj.getFullYear();
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      setReleaseDate(`${year}-${month}-${day}`);
                    } else {
                      setReleaseDate('');
                    }
                  } else if (currentMode && releaseDate) {
                    // When switching from date picker to manual, keep the date as is
                  } else {
                    setReleaseDate('');
                  }
                }}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                role="switch"
                aria-checked={useDatePicker}
              >
                <span
                  className={`${
                    useDatePicker ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
          </div>
          
          {useDatePicker ? (
            <input
              type="date"
              name="releaseDate"
              id="releaseDate"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
          ) : (
            <div>
              <input
                type="text"
                name="releaseDate"
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
                placeholder="YYYY-MM-DD, MM/DD/YYYY, or MM-DD-YYYY"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY
              </p>
            </div>
          )}
        </div>

        {/* Selected Movie Preview */}
        {selectedMovie && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Movie:</h3>
            <div className="flex items-center space-x-3">
              {selectedMovie.Poster && (
                <Image 
                  src={selectedMovie.Poster} 
                  alt={selectedMovie.Title}
                  width={48}
                  height={64}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedMovie.Title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">({selectedMovie.Year})</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Movie
        </button>
      </div>
    </form>
  );
};

export default AddMovieForm;
