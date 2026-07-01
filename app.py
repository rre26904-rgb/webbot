from flask import Flask, render_template, request, redirect, session, url_for
import requests
import json
import os

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", os.urandom(24))

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
# استخدام رابط ريندر المباشر الخاص بك
BASE_URL = os.getenv("RENDER_EXTERNAL_URL", "https://webbot-90as.onrender.com")
REDIRECT_URI = f"{BASE_URL}/callback"

# === قراءة الجيسون مع حماية قوية من الأخطاء ===
def get_points(user_id):
    try:
        with open("global_points.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get(str(user_id), 0)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0 # يرجع صفر لو الملف غير موجود أو فيه خطأ

def get_top_users():
    try:
        with open("global_points.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            # تصفية الأخطاء وترتيب النقاط للأعلى
            valid_users = {k: v for k, v in data.items() if isinstance(v, (int, float))}
            sorted_users = sorted(valid_users.items(), key=lambda x: x[1], reverse=True)
            return sorted_users[:5]
    except (FileNotFoundError, json.JSONDecodeError):
        return []

@app.route("/")
def index():
    top_users = get_top_users()
    return render_template("index.html", user=session.get("user"), top_users=top_users)

@app.route("/login")
def login():
    discord_login_url = f"https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify"
    return redirect(discord_login_url)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "حدث خطأ: لم يتم استلام كود التحقق من ديسكورد."
        
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    token_response = requests.post("https://discord.com/api/oauth2/token", data=data, headers=headers)
    if token_response.status_code != 200:
        return f"خطأ من ديسكورد: تأكد من تطابق رابط Redirect URI. التفاصيل: {token_response.text}"
        
    access_token = token_response.json()["access_token"]
    
    user_response = requests.get("https://discord.com/api/users/@me", headers={"Authorization": f"Bearer {access_token}"})
    user_data = user_response.json()
    
    user_data["points"] = get_points(user_data["id"])
    
    session["user"] = user_data
    return redirect(url_for("index"))

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)