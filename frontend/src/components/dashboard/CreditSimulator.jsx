import { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Sliders,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";
import LottiePackage from "lottie-react";
import coinAnimation from "../../assets/Fake 3D vector coin.json";

const Lottie = LottiePackage.default || LottiePackage;

const CreditSimulator = () => {
  const [simulationData, setSimulationData] = useState({
    creditlimit: "",
    monthlyemi: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token =
    localStorage.getItem("token") || cookieStore?.get?.("token")?.value;

  const handleSimulate = async (e) => {
     e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...simulationData };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        "http://localhost:4000/api/ml/simulate-credit",
        payload,
        config
      );
      if (res.data.success) {
        setResult(res.data.data);
        toast.success("Simulation complete!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Simulation failed. ML service might be down.");
    } finally {
      setLoading(false);
    }
  };

  const getImpactIcon = (impact) => {
    if (impact > 0) return <TrendingUp className="w-8 h-8 text-emerald-500" />;
    if (impact < 0) return <TrendingDown className="w-8 h-8 text-rose-500" />;
    return <Minus className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Credit Score Simulator
        </h2>
        <p className="text-slate-500 mt-2">
          Adjust financial metrics using AI to see the estimated impact on your
          credit score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#5B0A1C]">
              <Sliders className="w-5 h-5" /> {/* react icon*/}
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Simulation Variables
            </h3>
          </div>

          <form className="space-y-8" onSubmit={handleSimulate}>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-2">
                  Outstanding Credit Balance (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B0A1C] focus:border-transparent transition-all"
                    value={simulationData.creditlimit}
                    onChange={(e) =>
                      setSimulationData({
                        ...simulationData,
                        creditlimit:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    // here we cannot simply do Number(e.target.value) because if the user clears the input, it becomes an empty string which converrted into number become 0 so leaving 0 on input which is frustrating. So we check if it's an empty string first and set it to '' to allow clearing the input, otherwise we convert it to a number for valid inputs.
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  The total credit amount you have currently left.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-2">
                  Gross Monthly EMI (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B0A1C] focus:border-transparent transition-all"
                    value={simulationData.monthlyemi}
                    onChange={(e) =>
                      setSimulationData({
                        ...simulationData,
                        monthlyemi:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  The total amount you pay in EMIs each month.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#5B0A1C] hover:bg-[#420714] text-white py-4 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(91,10,28,0.5)] transition-all focus:outline-none disabled:opacity-70"
            >
              {loading ? (
                <div className="w-16 h-16 flex items-center justify-center -my-2">
                  <Lottie animationData={coinAnimation} loop={true} />
                </div>
              ) : (
                <>
                  <Activity className="w-5 h-5" /> Get your Score
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
          {!result ? (
            <div className="text-center text-slate-400 space-y-4">
              <Activity className="w-16 h-16 mx-auto opacity-50" />
              <p>
                Adjust the sliders and run the simulation to see your
                AI-predicted credit score.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
              <div>
                <p className="text-slate-500 font-medium mb-2">
                  Predicted Credit Score
                </p>
                <div
                  className={`text-6xl font-black ${result.predicted_score >= 700 ? "text-emerald-500" : result.predicted_score >= 600 ? "text-amber-500" : "text-rose-500"}`}
                >
                  {result.predicted_score}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Current Score
                  </p>
                  <p className="text-2xl font-bold text-slate-700">
                    {result.current_score}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 relative z-10">
                    Estimated Impact
                  </p>
                  <div className="flex items-center gap-1 relative z-10">
                    <span
                      className={`text-2xl font-bold ${result.impact > 0 ? "text-emerald-600" : result.impact < 0 ? "text-rose-600" : "text-slate-600"}`}
                    >
                      {result.impact > 0 ? "+" : ""}
                      {result.impact}
                    </span>
                  </div>
                  {/* Background faint icon */}
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    {getImpactIcon(result.impact)}
                  </div>
                </div>
              </div>

              {result.status && (
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize
                  ${
                    result.status === "improved"
                      ? "bg-emerald-100 text-emerald-700"
                      : result.status === "decreased"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Score {result.status}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditSimulator;
