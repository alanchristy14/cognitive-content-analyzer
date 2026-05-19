from flask import Flask, request, jsonify
from flask_cors import CORS
import textstat
import PyPDF2

app = Flask(__name__)
CORS(app)

# =========================
# IDIOM DATABASE
# =========================
IDIOMS = {
    "hit the ground running": "start quickly and effectively",
    "break the ice": "start a conversation",
    "bite the bullet": "do something difficult",
    "piece of cake": "very easy task",
    "once in a blue moon": "rarely happens",
    "let the cat out of the bag": "reveal a secret",
    "opened a can of worms": "created many unexpected problems"
}

# =========================
# IDIOM DETECTION
# =========================
def detect_idioms(text):

    text_lower = text.lower()
    found = []

    for idiom, meaning in IDIOMS.items():

        if idiom in text_lower:

            found.append({
                "phrase": idiom,
                "meaning": meaning
            })

    density = len(found)

    return {
        "idiomsFound": found,
        "idiomDensity": density
    }

# =========================
# COGNITIVE LOAD
# =========================
def cognitive_load(text):

    words = text.split()

    sentence_count = max(
        1,
        text.count(".") +
        text.count("!") +
        text.count("?")
    )

    avg_sentence_length = len(words) / sentence_count

    complex_words = len(
        [w for w in words if len(w) > 8]
    )

    complexity_score = (
        avg_sentence_length * 0.6
    ) + (
        complex_words * 0.4
    )

    if complexity_score < 10:
        level = "LOW"

    elif complexity_score < 20:
        level = "MEDIUM"

    else:
        level = "HIGH"

    return {
        "score": round(complexity_score, 2),
        "level": level
    }

# =========================
# ACCESSIBILITY SCORE
# =========================
def accessibility_score(readability):

    score = max(0, min(100, readability))

    if score >= 70:
        level = "HIGH"

    elif score >= 40:
        level = "MEDIUM"

    else:
        level = "LOW"

    return {
        "score": round(score, 2),
        "level": level
    }

# =========================
# AI SUGGESTIONS
# =========================
def generate_suggestions(
    readability,
    cognitive,
    idiom_density
):

    suggestions = []

    if readability < 50:
        suggestions.append(
            "Improve readability by shortening sentences."
        )

    if cognitive["level"] == "HIGH":
        suggestions.append(
            "Reduce cognitive complexity for better understanding."
        )

    if idiom_density > 0:
        suggestions.append(
            "Replace idioms for global audience accessibility."
        )

    return suggestions

# =========================
# RISK LABELS
# =========================
def generate_risks(
    cognitive,
    idiom_density
):

    risks = []

    if idiom_density > 0:
        risks.append("Translation Difficulty")
        risks.append("Global Audience Risk")

    if cognitive["level"] == "HIGH":
        risks.append("High Cognitive Load")

    return risks

# =========================
# TEXT SIMPLIFIER
# =========================
def simplify_text(text):

    replacements = {

        "utilize": "use",

        "leverage": "use",

        "facilitate": "help",

        "implementation": "development",

        "orchestration": "coordination",

        "distributed engineering teams":
        "teams working in different locations",

        "microservice architecture":
        "system made of small connected services",

        "scalability":
        "ability to grow",

        "fault tolerance":
        "ability to handle failures",

        "digital transformation":
        "digital changes",

        "enterprise-wide":
        "company-wide",

        "opened a can of worms":
        "created many unexpected problems"
    }

    simplified = text

    for old, new in replacements.items():

        simplified = simplified.replace(old, new)

        simplified = simplified.replace(
            old.capitalize(),
            new
        )

    return {
        "simplifiedText": simplified
    }

# =========================
# MAIN ANALYSIS ENGINE
# =========================
def analyze_text_logic(text):

    word_count = len(text.split())

    sentence_count = (
        text.count(".") +
        text.count("!") +
        text.count("?")
    )

    readability = (
        textstat.flesch_reading_ease(text)
        if text.strip()
        else 0
    )

    idiom_result = detect_idioms(text)

    cognitive = cognitive_load(text)

    accessibility = accessibility_score(readability)

    suggestions = generate_suggestions(
        readability,
        cognitive,
        idiom_result["idiomDensity"]
    )

    risks = generate_risks(
        cognitive,
        idiom_result["idiomDensity"]
    )

    # =========================
    # AI CONTENT SCORE
    # =========================

    score = 100

    # readability penalty
    if readability < 60:
        score -= 25

    # cognitive load penalty
    if cognitive["level"] == "HIGH":
        score -= 30

    elif cognitive["level"] == "MEDIUM":
        score -= 15

    # idiom penalty
    score -= idiom_result["idiomDensity"] * 5

    # accessibility penalty
    if accessibility["level"] == "LOW":
        score -= 20

    elif accessibility["level"] == "MEDIUM":
        score -= 10

    score = max(0, min(100, score))

    # =========================
    # SCORE LABEL
    # =========================

    if score >= 80:
        label = "EXCELLENT"

    elif score >= 60:
        label = "GOOD"

    elif score >= 40:
        label = "AVERAGE"

    else:
        label = "POOR"

    return {

        "wordCount": word_count,

        "sentenceCount": sentence_count,

        "readabilityScore": round(readability, 2),

        "idiomData": idiom_result,

        "cognitiveLoad": cognitive,

        "accessibility": accessibility,

        "suggestions": suggestions,

        "risks": risks,

        "contentScore": score,

        "scoreLabel": label
    }

# =========================
# HOME
# =========================
@app.route("/")
def home():

    return {
        "message": "Backend running successfully"
    }

# =========================
# ANALYZE API
# =========================
@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    text = data.get("text", "")

    return jsonify(
        analyze_text_logic(text)
    )

# =========================
# SIMPLIFY API
# =========================
@app.route("/simplify", methods=["POST"])
def simplify():

    data = request.get_json()

    text = data.get("text", "")

    return jsonify(
        simplify_text(text)
    )

# =========================
# PDF API
# =========================
@app.route("/upload-pdf", methods=["POST"])
def upload_pdf():

    if "file" not in request.files:

        return jsonify({
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    reader = PyPDF2.PdfReader(file)

    text = ""

    for page in reader.pages:

        text += (
            page.extract_text()
            or ""
        )

    result = analyze_text_logic(text)

    return jsonify({
        "analysis": result
    })

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":

    app.run(debug=True)