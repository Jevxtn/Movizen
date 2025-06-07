// src/services/omdbApi.ts
import { OMDbMovie } from '@/types';

const API_KEY = 'd555fd1f';
const BASE_URL = 'http://www.omdbapi.com/';

interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDbSearchResponse {
  Search?: OMDbSearchResult[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export const searchMovies = async (query: string): Promise<OMDbMovie[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}&type=movie`);
    const data: OMDbSearchResponse = await response.json();
    
    if (data.Response === 'True' && data.Search) {
      return data.Search.map((movie: OMDbSearchResult) => ({
        Title: movie.Title,
        Year: movie.Year,
        Released: '',
        Director: '',
        Genre: '',
        Plot: '',
        Poster: movie.Poster !== 'N/A' ? movie.Poster : '',
        imdbID: movie.imdbID,
        Response: 'True'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (imdbID: string): Promise<OMDbMovie | null> => {
  try {
    const response = await fetch(`${BASE_URL}?i=${imdbID}&apikey=${API_KEY}&plot=short`);
    const data = await response.json();
    
    if (data.Response === 'True') {
      return {
        Title: data.Title,
        Year: data.Year,
        Released: data.Released,
        Director: data.Director,
        Genre: data.Genre,
        Plot: data.Plot,
        Poster: data.Poster !== 'N/A' ? data.Poster : '',
        imdbID: data.imdbID,
        Response: 'True'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};
