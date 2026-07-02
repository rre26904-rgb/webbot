from flask import Flask, render_template, request, redirect, session, url_for
import requests
import json
import os
import time

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", os.urandom(24))

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
BOT_TOKEN = os.getenv("BOT_TOKEN")
BASE_URL = os.getenv("RENDER_EXTERNAL_URL", "https://webbot-90as.onrender.com")
REDIRECT_URI = f"{BASE_URL}/callback"

# ذاكرة مؤقتة وتخزين وقت آخر حظر
user_cache = {}
last_ban_time = 0 

def get_user_info(user_id):
    global last_ban_time
    
    # 1. إذا كنا محظورين من قبل ديسكورد (429)، ننتظر 5 دقائق قبل المحاولة
    if time.time() - last_ban_time < 300:
        return {"username": f"مستخدم_{user_id}", "avatar": "https://cdn.discordapp.com/embed/avatars/0.png"}

    if str(user_id) in user_cache:
        return user_cache[str(user_id)]
        
    if not BOT_TOKEN:
        return {"username": f"مستخدم_{user_id}", "avatar": "https://cdn.discordapp.com/embed/avatars/0.png"}
        
    try:
        headers = {"Authorization": f"Bot {BOT_TOKEN}"}
        resp = requests.get(f"https://discord.com/api/v10/users/{user_id}", headers=headers, timeout=5)
        
        # إذا حصلنا على حظر 429، نوقف الطلبات ونحفظ وقت الحظر
        if resp.status_code == 429:
            last_ban_time = time.time()
            return {"username": f"مستخدم_{user_id}", "avatar": "https://cdn.discordapp.com/embed/avatars/0.png"}
            
        if resp.status_code == 200:
            data = resp.json()
            username = data.get("global_name") or data.get("username")
            avatar_hash = data.get("avatar")
            avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png" if avatar_hash else "https://cdn.discordapp.com/embed/avatars/0.png"
            info = {"username": username, "avatar": avatar_url}
            user_cache[str(user_id)] = info
            return info
    except:
        pass
        
    return {"username": f"مستخدم_{user_id}", "avatar": "https://cdn.discordapp.com/embed/avatars/0.png"}

# ... بقية الدوال (get_points و get_top_users) تبقى كما هي بدون تغيير ...

def get_points(user_id):
    try:
        with open("global_points.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get(str(user_id), 0)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0

def get_top_users():
    try:
        with open("global_points.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            valid_users = {k: v for k, v in data.items() if isinstance(v, (int, float))}
            sorted_users = sorted(valid_users.items(), key=lambda x: x[1], reverse=True)
            top_10 = sorted_users[:10]
            enriched_top = []
            for user_id, points in top_10:
                info = get_user_info(user_id)
                enriched_top.append({"id": user_id, "points": points, "username": info["username"], "avatar": info["avatar"]})
            return enriched_top
    except:
        return []

# ... (بقية دوال Routes تبقى كما هي) ...
@app.route("/")
def index():
    top_users = get_top_users()
    return render_template("index.html", user=session.get("user"), top_users=top_users, search_result=None)

@app.route("/search")
def search():
    query = request.args.get("q", "").strip()
    top_users = get_top_users()
    search_result = None
    
    if query:
        points = get_points(query)
        if points > 0: # إذا كان عنده نقاط في الجيسون
            info = get_user_info(query)
            search_result = {
                "id": query,
                "points": points,
                "username": info["username"],
                "avatar": info["avatar"]
            }
        else:
            search_result = "not_found"
            
    return render_template("index.html", user=session.get("user"), top_users=top_users, search_result=search_result)

@app.route("/login")
def login():
    discord_login_url = f"https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify"
    return redirect(discord_login_url)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code: return "خطأ: لم يتم استلام كود التحقق."
        
    data = {
        "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code", "code": code, "redirect_uri": REDIRECT_URI
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    token_response = requests.post("https://discord.com/api/oauth2/token", data=data, headers=headers)
    
    if token_response.status_code != 200: return "خطأ في تسجيل الدخول."
        
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