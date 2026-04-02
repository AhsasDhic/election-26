"use client";

import { motion } from "framer-motion";
import { Candidate } from "@/types/election";
import AnimatedNumber from "./AnimatedNumber";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sounds";

export default function CandidateCard({
  candidate,
  rank,
  maxVotes,
  totalCategoryVotes,
}: {
  candidate: Candidate;
  rank: number;
  maxVotes: number;
  totalCategoryVotes: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevVotesRef = useRef(candidate.votes);
  const prevRankRef = useRef(rank);
  const cardRef = useRef<HTMLDivElement>(null);

  // Pulse effect when votes increase
  useEffect(() => {
    if (candidate.votes > prevVotesRef.current) {
      setIsPulsing(true);
      sounds.playPop();
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
    prevVotesRef.current = candidate.votes;
  }, [candidate.votes]);

  // Confetti effect when rank improves (numerical rank goes down)
  useEffect(() => {
    if (rank < prevRankRef.current) {
      if (cardRef.current) {
        sounds.playTada();
        const rect = cardRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 45,
          spread: 60,
          gravity: 0.6,
          origin: { x, y },
          colors: ['#D4AF37', '#94A3B8', '#FFFFFF', '#F8FAFC']
        });
      }
    }
    prevRankRef.current = rank;
  }, [rank]);

  const percentage =
    totalCategoryVotes > 0
      ? Math.round((candidate.votes / totalCategoryVotes) * 100)
      : 0;

  const relativeWidth =
    maxVotes > 0 ? Math.round((candidate.votes / maxVotes) * 100) : 0;

  // Derive the image path using the exact candidate name (which handles the spaces in the filename directly)
  const imagePath = `/images/${candidate.name}.png`;

  return (
    <motion.div
      ref={cardRef}
      layout
      // Animate scale up if pulsing
      animate={{ scale: isPulsing ? 1.05 : 1 }}
      transition={{
        // Elastic Re-ordering bounds
        layout: { type: "spring", stiffness: 300, damping: 30 },
        // Pulse scaling bounds
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className={`relative rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-sm bg-[#F8FAFC] shadow-sm transform-gpu transition-[box-shadow,border-color] duration-300 ${
        rank === 1
          ? "border border-[#D4AF37]/50 shadow-[0_4px_25px_-5px_rgba(212,175,55,0.25)]"
          : "border border-zinc-200"
      } ${isPulsing ? "ring-2 ring-[#D4AF37]/40 shadow-xl" : ""}`}
    >
      {/* Rank Indicator Top Left */}
      <div
        className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
          rank === 1
            ? "bg-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/40"
            : "bg-white text-[#94A3B8] border border-zinc-200"
        }`}
      >
        #{rank}
      </div>

      <div className="flex items-center gap-4">
        {/* Photo */}
        <div
          className={`shrink-0 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative bg-white ${
            rank === 1 ? "ring-2 ring-[#D4AF37] ring-offset-2" : "border border-zinc-200"
          }`}
        >
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePath}
              alt={candidate.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl font-bold text-[#94A3B8]">
              {candidate.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-lg truncate text-[#18181B]"
          >
            {candidate.name}
          </h3>
          
          <div className="flex justify-between items-end mt-1">
            <div className={`text-2xl font-black ${rank === 1 ? 'text-[#D4AF37]' : 'text-[#18181B]'}`}>
              <AnimatedNumber value={candidate.votes} />
            </div>
            <div className="text-xs text-[#94A3B8] font-semibold tracking-wide">
              {percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden mt-1 relative">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            rank === 1
              ? "bg-[#D4AF37]"
              : "bg-[#94A3B8]"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${relativeWidth}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
