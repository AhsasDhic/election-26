"use client";

import { Candidate } from "@/types/election";
import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function AdminCandidateControl({
  categoryId,
  candidate,
}: {
  categoryId: string;
  candidate: Candidate;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | "">(1);

  const handleUpdate = async (delta: number) => {
    setIsUpdating(true);
    const candidateRef = ref(
      database,
      `election/${categoryId}/candidates/${candidate.id}`
    );
    const newVotes = Math.max(0, candidate.votes + delta); // Prevent negative votes
    
    // Provide a small UI delay/haptic feedback feel
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    try {
      await update(candidateRef, { votes: newVotes });
    } catch (error) {
      console.error("Failed to update votes:", error);
      alert("Failed to update votes");
    } finally {
      setTimeout(() => setIsUpdating(false), 200); // UI visual timeout
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 text-lg">{candidate.name}</h4>
        <span className="text-slate-500 font-medium">{candidate.votes} votes</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (typeof customAmount === 'number' && customAmount > 0) {
              handleUpdate(-customAmount);
            }
          }}
          disabled={isUpdating || candidate.votes === 0 || customAmount === ""}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200 disabled:opacity-50 transition-colors"
          aria-label="Decrease votes"
        >
          <Minus size={24} />
        </button>
        
        <input
          type="number"
          min="1"
          value={customAmount}
          onChange={(e) => {
            const val = e.target.value;
            setCustomAmount(val === "" ? "" : Math.max(1, parseInt(val) || 1));
          }}
          className="w-16 h-12 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        
        <button
          onClick={() => {
            if (typeof customAmount === 'number' && customAmount > 0) {
              handleUpdate(customAmount);
            }
          }}
          disabled={isUpdating || customAmount === ""}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 active:bg-blue-200 disabled:opacity-50 transition-colors shadow-sm"
          aria-label="Increase votes"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
