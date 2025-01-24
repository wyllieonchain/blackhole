import Image from 'next/image'
import Header from '../../components/Header'

export default function Graph() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <Image 
          src="/graph.jpg"
          alt="Graph visualization"
          width={900}
          height={900}
          className="graph-image"
        />
        <h1 className="text-4xl font-bold text-center">
          Graph Visualization
        </h1>
      </div>
    </main>
  );
} 