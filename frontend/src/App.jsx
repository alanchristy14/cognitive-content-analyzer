import { useState } from "react";
import axios from "axios";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simplified, setSimplified] = useState("");

  // =========================
  // ANALYZE TEXT
  // =========================
  const analyzeText = async () => {

    setLoading(true);
    setResult(null);
    setSimplified("");

    try {

      // ANALYSIS API
      const analysisResponse = await axios.post(
        "http://127.0.0.1:5000/analyze",
        {
          text: text,
        }
      );

      // SIMPLIFY API
      const simplifyResponse = await axios.post(
        "http://127.0.0.1:5000/simplify",
        {
          text: text,
        }
      );

      setTimeout(() => {

        setResult(analysisResponse.data);

        setSimplified(
          simplifyResponse.data.simplifiedText
        );

        setLoading(false);

      }, 1000);

    } catch (error) {

      console.log(error);
      setLoading(false);

    }
  };

  // =========================
  // PDF UPLOAD
  // =========================
  const uploadPDF = async (file) => {

    setLoading(true);
    setResult(null);
    setSimplified("");

    const formData = new FormData();

    formData.append("file", file);

    try {

      const response = await axios.post(
        "http://127.0.0.1:5000/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTimeout(() => {

        setResult(response.data.analysis);

        setLoading(false);

      }, 1000);

    } catch (error) {

      console.log(error);
      setLoading(false);

    }
  };

  // =========================
  // FILE HANDLER
  // =========================
  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0];

    if (selectedFile) {

      setFile(selectedFile);

      uploadPDF(selectedFile);

    } else {

      setFile(null);

    }
  };

  // =========================
  // RESET
  // =========================
  const handleReset = () => {

    setText("");
    setFile(null);
    setResult(null);
    setSimplified("");
    setLoading(false);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-8">

      {/* TITLE */}
      <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-12">
        AI Content Intelligence Platform
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ========================= */}
        {/* LEFT SIDE */}
        {/* ========================= */}

        <div className="lg:w-1/2 bg-white p-6 rounded-3xl shadow-2xl">

          <h2 className="text-2xl font-bold mb-5 text-gray-700">
            Input Content
          </h2>

          {/* TEXT AREA */}
          <textarea
            className="w-full h-80 p-5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            placeholder="Enter your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* PDF UPLOAD */}
          <div className="mt-5 flex items-center justify-between bg-gray-100 p-4 rounded-xl">

            <label className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold">

              Upload PDF

              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />

            </label>

            <span className="text-sm text-gray-600 truncate max-w-[60%]">
              {file ? file.name : "No file chosen"}
            </span>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-6">

            {/* ANALYZE */}
            <button
              onClick={analyzeText}
              disabled={loading}
              className={`w-1/2 py-3 rounded-xl text-white text-lg font-semibold transition ${
                loading
                  ? "bg-blue-400 animate-pulse cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >

              {loading ? "Analyzing..." : "Analyze"}

            </button>

            {/* RESET */}
            <button
              onClick={handleReset}
              className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl text-lg font-semibold"
            >

              Reset

            </button>

          </div>

        </div>

        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}

        <div className="lg:w-1/2 bg-white p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">

          <h2 className="text-3xl font-bold mb-6 text-gray-700">
            AI Analysis Dashboard
          </h2>

          {/* LOADING */}
          {loading && (

            <div className="flex flex-col items-center justify-center mt-24">

              <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>

              <p className="mt-5 text-blue-600 text-lg font-semibold animate-pulse">
                Processing AI Analysis...
              </p>

            </div>

          )}

          {/* RESULTS */}
          {!loading && result && (

            <div className="space-y-6">

              {/* AI CONTENT SCORE */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-3xl shadow-xl text-center">

                <h2 className="text-2xl font-bold mb-2">
                  AI Content Score
                </h2>

                <p className="text-6xl font-extrabold">
                  {result.contentScore}/100
                </p>

                <p className="mt-3 text-xl font-semibold tracking-wide">
                  {result.scoreLabel}
                </p>

              </div>

              {/* METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-blue-100 p-5 rounded-2xl shadow-md">
                  <h3 className="font-bold text-blue-800">
                    Word Count
                  </h3>

                  <p className="text-3xl mt-3 font-bold">
                    {result.wordCount}
                  </p>
                </div>

                <div className="bg-green-100 p-5 rounded-2xl shadow-md">
                  <h3 className="font-bold text-green-800">
                    Sentence Count
                  </h3>

                  <p className="text-3xl mt-3 font-bold">
                    {result.sentenceCount}
                  </p>
                </div>

                <div className="bg-yellow-100 p-5 rounded-2xl shadow-md">
                  <h3 className="font-bold text-yellow-800">
                    Readability
                  </h3>

                  <p className="text-3xl mt-3 font-bold">
                    {result.readabilityScore}
                  </p>
                </div>

              </div>

              {/* ACCESSIBILITY */}
              {result.accessibility && (

                <div className="bg-cyan-100 p-5 rounded-2xl shadow-md">

                  <div className="flex justify-between items-center">

                    <h3 className="font-bold text-cyan-800 text-lg">
                      Accessibility Score
                    </h3>

                    <span className="font-bold text-xl">
                      {result.accessibility.score}/100
                    </span>

                  </div>

                  <div className="w-full bg-white rounded-full h-5 mt-4 overflow-hidden">

                    <div
                      className="bg-cyan-600 h-5 rounded-full"
                      style={{
                        width: `${result.accessibility.score}%`,
                      }}
                    ></div>

                  </div>

                  <p className={`font-bold mt-3 ${
                    result.accessibility.level === "HIGH"
                      ? "text-green-700"
                      : result.accessibility.level === "MEDIUM"
                      ? "text-yellow-700"
                      : "text-red-700"
                  }`}>
                    {result.accessibility.level}
                  </p>

                </div>

              )}

              {/* IDIOMS */}
              {result.idiomData && (

                <div className="bg-purple-100 p-5 rounded-2xl shadow-md">

                  <h3 className="font-bold mb-4 text-purple-800 text-lg">
                    Idioms Detected
                  </h3>

                  {result.idiomData.idiomsFound.length > 0 ? (

                    result.idiomData.idiomsFound.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="mb-4 bg-white p-3 rounded-xl"
                        >

                          <p className="font-bold text-purple-700">
                            {item.phrase}
                          </p>

                          <p className="text-gray-700 mt-1">
                            → {item.meaning}
                          </p>

                        </div>
                      )
                    )

                  ) : (

                    <p>No idioms detected</p>

                  )}

                  <p className="mt-3 font-semibold">
                    Density: {result.idiomData.idiomDensity}
                  </p>

                </div>

              )}

              {/* COGNITIVE LOAD */}
              {result.cognitiveLoad && (

                <div className="bg-red-100 p-5 rounded-2xl shadow-md">

                  <h3 className="font-bold mb-4 text-red-800 text-lg">
                    Cognitive Load
                  </h3>

                  <div className="flex justify-between">

                    <p className="font-semibold">
                      Level:
                    </p>

                    <span className={`font-bold ${
                      result.cognitiveLoad.level === "HIGH"
                        ? "text-red-700"
                        : result.cognitiveLoad.level === "MEDIUM"
                        ? "text-yellow-700"
                        : "text-green-700"
                    }`}>
                      {result.cognitiveLoad.level}
                    </span>

                  </div>

                  <div className="flex justify-between mt-2">

                    <p className="font-semibold">
                      Score:
                    </p>

                    <span className="font-bold">
                      {result.cognitiveLoad.score}
                    </span>

                  </div>

                </div>

              )}

              {/* AI SUGGESTIONS */}
              {result.suggestions && (

                <div className="bg-indigo-100 p-5 rounded-2xl shadow-md">

                  <h3 className="font-bold mb-4 text-indigo-800 text-lg">
                    AI Suggestions
                  </h3>

                  <ul className="list-disc ml-6 space-y-2">

                    {result.suggestions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="text-gray-700"
                        >
                          {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              )}

              {/* RISK LABELS */}
              {result.risks &&
                result.risks.length > 0 && (

                <div className="bg-orange-100 p-5 rounded-2xl shadow-md">

                  <h3 className="font-bold mb-4 text-orange-800 text-lg">
                    Risk Labels
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {result.risks.map(
                      (risk, index) => (

                        <span
                          key={index}
                          className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md text-sm font-semibold"
                        >

                          ⚠ {risk}

                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

              {/* SIMPLIFIED VERSION */}
              {simplified && (

                <div className="bg-purple-50 border-l-8 border-purple-500 p-5 rounded-2xl shadow-md">

                  <h3 className="font-bold mb-4 text-purple-700 text-lg">
                    Simplified Version
                  </h3>

                  <p className="text-gray-800 leading-8 text-lg">
                    {simplified}
                  </p>

                </div>

              )}

            </div>

          )}

          {/* EMPTY */}
          {!loading && !result && !simplified && (

            <div className="text-center text-gray-400 mt-24 text-lg">

              Analysis results will appear here

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default App;