import sys
from unittest.mock import MagicMock
sys.modules['audioop'] = MagicMock()
import discord
from discord.ext import commands
import asyncio
import os
from flask import Flask, jsonify
import json
import threading

# تعريف الـ API
api_app = Flask(__name__)

@api_app.route("/get_points")
def get_points():
    try:
        with open("global_points.json", "r", encoding="utf-8") as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({"error": str(e)})

def run_api():
    # Railway يعطينا البورت في متغير البيئة PORT
    port = int(os.getenv("PORT", 8080))
    api_app.run(host='0.0.0.0', port=port)

# تشغيل الـ API في خيط منفصل فوراً
threading.Thread(target=run_api, daemon=True).start()




# حل مشكلة الـ Event Loop لنظام ويندوز (ما يضر وجوده في ريندر)
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# 🔒 تعديل التوكن: خليناه BOT_TOKEN عشان يطابق المتغير اللي ضفناه في Render
# بدل os.getenv("BOT_TOKEN") المباشر، جرب هذا:
TOKEN = os.getenv("BOT_TOKEN")
if not TOKEN:
    print("⚠️ تحذير: لم يتم العثور على التوكن أثناء البناء، سيتم محاولة جلبه في وقت التشغيل.")

intents = discord.Intents.default()
intents.message_content = True 
intents.guilds = True
intents.voice_states = True   # ممتاز للكوجات الصوتية
intents.members = True        # ضروري جداً للألعاب عشان تتعرف على الأعضاء

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f'======================================')
    print(f'تم تسجيل الدخول: {bot.user.name}')
    print(f'البوت جاهز والألعاب محملة تلقائياً!')
    print(f'======================================')

async def main():
    async with bot:
        # البحث التلقائي عن الملفات التي تنتهي بـ _cog.py في نفس المجلد
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        for filename in os.listdir(current_dir):
            if filename.endswith("_cog.py"):
                cog_name = filename[:-3] # حذف .py من الاسم
                try:
                    await bot.load_extension(cog_name)
                    print(f"✅ تم تحميل: {cog_name}")
                except Exception as e:
                    print(f"❌ فشل تحميل {cog_name}: {e}")
        
        # التأكد من أن التوكن تم تعريفه في السيرفر قبل التشغيل
        if not TOKEN:
            print("❌ خطأ: لم يتم العثور على متغير BOT_TOKEN في إعدادات Render!")
            return
            
        await bot.start(TOKEN)

if __name__ == "__main__":
    asyncio.run(main())