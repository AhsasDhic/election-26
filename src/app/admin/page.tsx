"use client";

import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { ElectionData } from "@/types/election";
import AdminCandidateControl from "@/components/AdminCandidateControl";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

// Seed data based on requirements
const initialSeedData: ElectionData = {
  president: {
    id: "president",
    title: "President",
    candidates: {
      "c_p1": { id: "c_p1", name: "Cristiano Fawad", votes: 0 },
      "c_p2": { id: "c_p2", name: "Amir Shezin", votes: 0 },
      "c_p3": { id: "c_p3", name: "Arshad", votes: 0 },
      "c_p4": { id: "c_p4", name: "Sayyid Ameen Thangal", votes: 0 },
    }
  },
  secretary: {
    id: "secretary",
    title: "Secretary",
    candidates: {
      "c_s1": { id: "c_s1", name: "Yaseen Elamabara", votes: 0 },
      "c_s2": { id: "c_s2", name: "Hashir Pulloppi", votes: 0 },
      "c_s3": { id: "c_s3", name: "Goat Femin", votes: 0 },
    }
  },
  treasurer: {
    id: "treasurer",
    title: "Treasurer",
    candidates: {
      "c_t1": { id: "c_t1", name: "Pinarayi Rizwan", votes: 0 },
      "c_t2": { id: "c_t2", name: "Mis-ab Michappu", votes: 0 },
      "c_t3": { id: "c_t3", name: "Rayyan PA", votes: 0 },
      "c_t4": { id: "c_t4", name: "Shameel Kannur City", votes: 0 },
    }
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [data, setData] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Only subscribe to database if authenticated
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleSeedData = async () => {
    const confirmSeed = window.confirm("Are you sure you want to initialize/reset the database? This will clear all existing votes!");
    if (!confirmSeed) return;

    try {
      const electionRef = ref(database, "election");
      await set(electionRef, initialSeedData);
      alert("Database initialized successfully!");
    } catch (error) {
      console.error("Seed error", error);
      alert("Failed to initialize database. Check permissions.");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Admin Access</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="Enter admin password"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition-colors"
            >
              Login
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Use 'admin123' if env var is not set.
            </p>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Control Panel</h1>
            <p className="text-slate-500 text-sm">Update vote counts in real-time</p>
          </div>
          <button 
            onClick={handleSeedData}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors text-sm"
          >
            Reset & Seed Data
          </button>
        </header>

        {loading ? (
           <div className="text-center py-12 text-slate-500">Loading initial data...</div>
        ) : errorMsg ? (
          <div className="bg-red-50 p-8 rounded-2xl shadow-sm border border-red-100 text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-700">Connection Error</h2>
            <p className="text-red-500">{errorMsg}</p>
          </div>
        ) : !data ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">No Election Data Found</h2>
            <p className="text-slate-500">Please seed the database to get started.</p>
            <button 
              onClick={handleSeedData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Initialize Database
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {["president", "secretary", "treasurer"].map((categoryId) => {
              const category = data[categoryId];
              if (!category) return null;
              
              const candidatesArray = Object.values(category.candidates || {});
              
              return (
                <section key={categoryId} className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-700 capitalize border-b border-slate-200 pb-2">
                    {category.title}
                  </h2>
                  <div className="space-y-3">
                    {candidatesArray.map((candidate) => (
                      <AdminCandidateControl 
                        key={candidate.id}
                        categoryId={categoryId}
                        candidate={candidate}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
