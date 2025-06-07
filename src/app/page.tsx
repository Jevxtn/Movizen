"use client"; // This is a client component

import { useState, useEffect } from 'react';
import { Movie } from "@/types";
import { Header } from "@/components/Header";
import { AddMovieForm } from "@/components/AddMovieForm";
import { MovieList } from "@/components/MovieList";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after the component has mounted on the client
    if (isClient) {
      // Load movies from localStorage if available
      const storedMovies = localStorage.getItem('movizenMovies');
      if (storedMovies) {
        try {
          // Make sure to parse dates correctly
          const parsedMovies = JSON.parse(storedMovies).map((movie: Pick<Movie, 'id' | 'title' | 'description' | 'posterUrl'> & { releaseDate: string }) => ({
            ...movie,
            releaseDate: new Date(movie.releaseDate),
          }));
          setMovies(parsedMovies);
        } catch (error) {
          console.error("Failed to parse stored movies:", error);
          // Fallback to empty array on error
          setMovies([]);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    // Save movies to localStorage whenever the movies state changes
    // This check ensures localStorage is only accessed on the client side
    if (isClient && movies.length > 0) {
      // Convert Date objects to ISO strings for proper serialization
      const serializedMovies = movies.map(movie => ({
        ...movie,
        releaseDate: movie.releaseDate instanceof Date 
          ? movie.releaseDate.toISOString() 
          : movie.releaseDate
      }));
      localStorage.setItem('movizenMovies', JSON.stringify(serializedMovies));
    }
  }, [movies, isClient]);

  const handleAddMovie = (movieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: uuidv4(), // Generate a unique ID
    };
    setMovies((prevMovies) => [...prevMovies, newMovie]);
  };

  const handleRemoveMovie = (id: string) => {
    setMovies((prevMovies) => prevMovies.filter(movie => movie.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="container mx-auto p-4 sm:p-8">
        <AddMovieForm onAddMovie={handleAddMovie} />
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">Upcoming Movies</h2>
          {isClient ? <MovieList movies={movies} onRemoveMovie={handleRemoveMovie} /> : 
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-center text-gray-600 dark:text-gray-400">
                <p>Loading movies...</p>
              </div>
            </div>
          }
        </section>
      </main>
      <footer className="text-center p-4 mt-8 bg-gray-200 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Movizen. Vegz. All rights reserved.</p>
        <p>Stay tuned for more features!</p>
      </footer>
    </div>
  );
}
