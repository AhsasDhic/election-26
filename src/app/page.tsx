"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { ElectionData } from "@/types/election";
import CandidateCard from "@/components/CandidateCard";
import { LayoutGroup } from "framer-motion";
import { sounds } from "@/lib/sounds";

export default function Home() {
  const [data, setData] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const toggleSound = () => {
    if (soundEnabled) {
      sounds.disable();
      setSoundEnabled(false);
    } else {
      sounds.enable();
      setSoundEnabled(true);
      sounds.playPop();
    }
  };

  useEffect(() => {
    const electionRef = ref(database, "election");
    const unsubscribe = onValue(
      electionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase subscription error:", error);
        setErrorMsg(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] z-10"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p className="max-w-md">{errorMsg}</p>
        <p className="mt-4 text-sm text-zinc-500">
          Please check your Firebase Realtime Database Security Rules and ensure read access is allowed.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center text-zinc-500">
        <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
        <p>Please initialize the election data from the admin panel.</p>
      </div>
    );
  }

  // Pre-defined ordered categories based on requirements
  const orderedKeys = ["president", "secretary", "treasurer"].filter(
    (key) => data[key]
  );

  return (
    <main className="min-h-screen bg-white text-zinc-950 p-4 md:p-6 lg:p-8 font-sans selection:bg-[#D4AF37]/20 selection:text-zinc-900 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <header className="text-center mb-10 lg:mb-14 relative z-10 pt-4">
          <div className="absolute top-0 right-4 flex items-center justify-end">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border border-zinc-200 shadow-sm transition-colors ${
                soundEnabled ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-white text-zinc-400 hover:text-zinc-600'
              }`}
              title={soundEnabled ? "Disable Sounds" : "Enable Sounds"}
            >
              {soundEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
              )}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-zinc-950 mb-4 uppercase">
            Live <span className="text-[#D4AF37]">Results</span>
          </h1>
          <p className="text-[#94A3B8] text-lg font-medium uppercase tracking-widest">
            Real-Time Election Board
          </p>
        </header>

        <LayoutGroup>
          {/* Main Grid Wrapper for 3 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10">
            {orderedKeys.map((categoryId) => {
              const category = data[categoryId];
              const candidatesArray = Object.values(category.candidates || {});

              // Sort by votes (descending)
              const sortedCandidates = [...candidatesArray].sort(
                (a, b) => b.votes - a.votes
              );

              // Calculate max and total votes for the progress bar visualizations
              const maxVotes =
                sortedCandidates.length > 0 ? sortedCandidates[0].votes : 0;
              const totalVotes = candidatesArray.reduce(
                (acc, curr) => acc + curr.votes,
                0
              );

              return (
                <section
                  key={categoryId}
                  className="flex flex-col bg-[#F8FAFC] border border-zinc-100 p-6 sm:p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                >
                  <div className="flex items-center justify-center mb-8 border-b border-zinc-200 pb-4">
                    <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-[0.2em]">
                      {category.title}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-5 flex-1 relative">
                    {/* The candidates within this column */}
                    {sortedCandidates.map((candidate, index) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        rank={index + 1}
                        maxVotes={maxVotes}
                        totalCategoryVotes={totalVotes}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </LayoutGroup>

        <footer className="pt-12 pb-6 text-center text-xs font-semibold tracking-widest uppercase text-zinc-400 relative z-10">
          <p>Powered by Real-Time Data</p>
        </footer>
      </div>
    </main>
  );
}
