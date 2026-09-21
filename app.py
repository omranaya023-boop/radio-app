from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

MIRRORS = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info",
]

def fetch_stations(params):
    for base in MIRRORS:
        try:
            r = requests.get(f"{base}/json/stations/search",
                             params=params, timeout=8,
                             headers={"User-Agent": "MyRadioApp/1.0"})
            if r.status_code == 200:
                return r.json()
        except Exception:
            continue
    return []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/stations")
def stations():
    query = request.args.get("q", "").strip()
    country = request.args.get("country", "").strip()

    params = {
        "limit": 40,
        "hidebroken": "true",
        "order": "clickcount",
        "reverse": "true",
    }
    if query:
        params["name"] = query
    if country:
        params["country"] = country

    data = fetch_stations(params)
    cleaned = []
    for s in data:
        url = s.get("url_resolved") or s.get("url")
        if not url:
            continue
        cleaned.append({
            "id": s.get("stationuuid"),
            "name": s.get("name"),
            "country": s.get("country"),
            "tags": s.get("tags"),
            "favicon": s.get("favicon"),
            "url": url,
            "bitrate": s.get("bitrate"),
        })
    return jsonify(cleaned)

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)