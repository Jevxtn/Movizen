export interface Movie {
  id: string;
  title: string;
  releaseDate: Date; // Use Date object for easier manipulation
  posterUrl?: string; // Optional: URL to the movie poster
  description?: string; // Optional: A brief description or synopsis
  imdbID?: string; // OMDb API movie ID
  year?: string; // Movie year from OMDb
  director?: string; // Director from OMDb
  genre?: string; // Genres from OMDb
  plot?: string; // Plot from OMDb
  // Possible future additions:
  // userRating?: number; // 0-10 or similar
  // addedAt: Date; // When the movie was added to the list
}

// OMDb API response interface
export interface OMDbMovie {
  Title: string;
  Year: string;
  Released: string;
  Director: string;
  Genre: string;
  Plot: string;
  Poster: string;
  imdbID: string;
  Response: string;
  Error?: string;
}
