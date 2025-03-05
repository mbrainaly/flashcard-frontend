'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { IQuiz } from '@/types/quiz';

export default function QuizzesPage() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }

        const data = await response.json();
        setQuizzes(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accessToken) {
      fetchQuizzes();
    }
  }, [session?.user?.accessToken]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Your Quizzes</h1>
        <Link
          href="/quizzes/generate"
          className="px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
        >
          Create Quiz
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Link
            key={quiz._id}
            href={`/quizzes/${quiz._id}`}
            className="block group"
          >
            <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10 transition-all duration-300 group-hover:ring-accent-neon/30">
              <h2 className="text-xl font-semibold text-white group-hover:text-accent-neon transition-colors">
                {quiz.title}
              </h2>
              <p className="mt-2 text-accent-silver line-clamp-2">
                {quiz.description || 'No description'}
              </p>
              
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="text-sm text-accent-silver">Questions</p>
                  <p className="text-lg font-medium text-white">{quiz.questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-accent-silver">Attempts</p>
                  <p className="text-lg font-medium text-white">{quiz.attempts.length}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-accent-silver">You haven't created any quizzes yet.</p>
            <Link
              href="/quizzes/generate"
              className="inline-block mt-4 px-6 py-2 bg-accent-neon text-black rounded-full hover:bg-accent-neon/90 transition-colors"
            >
              Create Your First Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 