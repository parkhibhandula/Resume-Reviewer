import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "./pdf-worker";
import Markdown from "react-markdown";
import axios from "axios";

function App() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [suggestions, setSuggestions] = useState("");
  const [updated_resume, setupdated_resume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleResumeUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  reader.onload = async () => {
    try {
      const pdfData = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let extractedText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      console.log("Resume Text:", extractedText);
      setResumeText(extractedText);
    } catch (err) {
      console.error("Error extracting PDF text:", err);
      setError("Failed to extract resume. Please try again.");
    }
  };
};


 const review = async () => {
  if (!jd.trim() || !resumeText.trim()) {
    alert("Please upload a resume and enter the job description.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const prompt = `
Job Description:
${jd}

Resume:
${resumeText}
    `;

    console.log("Sending Prompt to Backend:", prompt);

    const response = await axios.post("http://localhost:3000/ai/getReview", { prompt });

    console.log("API Response:", response.data);
 let rawData = response.data;
     if (typeof rawData === "string") {
      rawData = rawData.replace(/```json|```/g, "").trim();
    }
     let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (error) {
      console.error("JSON Parse Error:", error);
      return;
    }
 

   
    setScore(parsedData.score ?? 0);
    setMatchedSkills(Array.isArray(parsedData.matched_skills) ? parsedData.matched_skills : []);
    setMissingSkills(Array.isArray(parsedData.missing_skills) ? parsedData.missing_skills : []);
    setSuggestions(
      Array.isArray(parsedData.suggestions)
        ? parsedData.suggestions.join("\n\n") // Convert array to readable text
        : parsedData.suggestions || "No suggestions available."
    );
    setupdated_resume(parsedData.updated_resume || "");
  } catch (err) {
    console.error("Error fetching review:", err);
    setError("Failed to fetch review. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm"
        style={{ backgroundColor: "#1E293B" }}
      >
        <div className="container">
          <a className="navbar-brand fw-bold fs-4" href="#">
            Resume Review
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid mt-4">
        <div className="row g-4">
          {/* Left Section */}
          <div className="row">
            <div className="card shadow-sm p-4 rounded-4 border-0 bg-white">
              <h4 className="fw-semibold mb-3 text-dark">Job Description</h4>
              <div className="input-group mb-3">
                <textarea
                  className="form-control premium-input"
                  id="jd"
                  placeholder="Paste the job description here..."
                  rows="5"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>

              <h4 className="fw-semibold mb-2 text-dark">Upload Resume</h4>
              <div className="input-group mb-3">
                <input
                  type="file"
                  className="form-control premium-input"
                  id="resumeUpload"
                  onChange={handleResumeUpload}
                  accept="application/pdf"
                />
              </div>

              <button
                type="button"
                onClick={review}
                className="btn btn-dark w-100 mt-2 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Get Review"}
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="row">
            <div className="card shadow-sm p-4 rounded-4 border-0 bg-white">
              <h4 className="fw-semibold mb-3 text-dark">Analysis Results</h4>

              {/* Score */}
              <div className="mb-4 text-center">
                <div className="score-circle mx-auto d-flex justify-content-center align-items-center">
                  <span className="fw-bold fs-3">
                    {score !== null ? `${score}%` : "--"}
                  </span>
                </div>
                <p className="mt-2 text-muted">Overall Match Score</p>
              </div>

              {/* Matched Skills */}
              <div className="mb-3">
                <h5 className="fw-semibold">Matched Skills</h5>
                <div className="badge-container">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((skill, index) => (
                      <span key={index} className="badge premium-badge">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">No matched skills yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="mb-3">
                <h5 className="fw-semibold">Missing Skills</h5>
                <div className="badge-container">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, index) => (
                      <span key={index} className="badge missing-badge">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">No missing skills</span>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="mb-3">
                <h5 className="fw-semibold">Suggestions</h5>
                <div className="suggestion-box p-3 rounded">
                  {suggestions || "No suggestions yet"}
                </div>
              </div>

              {/* Updated Resume */}
              <h5 className="updatedresume"><b>Updated Resume</b></h5>
     {updated_resume && (
        <div
          className="p-3 rounded mt-3"
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            maxHeight: "500px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {/* Name / Title */}
          <h4>{updated_resume.Title}</h4>
          <p>
            <strong>Contact:</strong> {updated_resume.Contact}
          </p>
          <p>
            <strong>Summary:</strong> {updated_resume.Summary}
          </p>

          {/* Education */}
          <h5 className="mt-3">Education:</h5>
          <ul>
            {updated_resume.Education?.map((edu, i) => (
              <li key={i}>
                <b>{edu.Degree}</b> - {edu.Institution} ({edu.Years}){" "}
                {edu.Details && ` | ${edu.Details}`}
              </li>
            ))}
          </ul>

          {/* Experience */}
          <h5 className="mt-3">Experience:</h5>
          <ul>
            {updated_resume.Experience?.map((exp, i) => (
              <li key={i}>
                <b>{exp.Title}</b> at {exp.Company} ({exp.Dates})
                <ul>
                  {exp.Details?.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Technical Skills */}
          <h5 className="mt-3">Technical Skills:</h5>
          <ul>
            {Object.entries(updated_resume["Technical Skills"] || {}).map(
              ([key, value], i) => (
                <li key={i}>
                  <b>{key}:</b> {value}
                </li>
              )
            )}
          </ul>

          {/* Projects */}
          <h5 className="mt-3">Projects:</h5>
          {updated_resume.Projects?.map((proj, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <h6>{proj.Title}</h6>
              <p>
                <b>Technologies:</b> {proj.Technologies}
              </p>
              <ul>
                {proj.Details?.map((detail, j) => (
                  <li key={j}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Achievements */}
          <h5 className="mt-3">Achievements & Certifications:</h5>
          <ul>
            {updated_resume["Achievements & Certifications"]?.map(
              (ach, i) => (
                <li key={i}>{ach}</li>
              )
            )}
          </ul>

          {/* Coursework */}
          <h5 className="mt-3">Coursework Highlights:</h5>
          <ul>
            {updated_resume["Coursework Highlights"]?.map((course, i) => (
              <li key={i}>{course}</li>
            ))}
          </ul>
        </div>
      )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
