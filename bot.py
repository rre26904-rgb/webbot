import nextcord
from nextcord.ext import commands
import json
import os

# تشغيل البوت مع الانتنست الكاملة (عدلها حسب حاجتك)
intents = nextcord.Intents.all()
bot = commands.Bot(command_prefix="!", intents=intents)

# ملف النقاط الخاص بك اللي تعتمد عليه كل ألعابك
scores_file = "global_points.json"

@bot.event
async def on_ready():
    print(f"تم تشغيل البوت بنجاح كـ {bot.user} وهو الآن متصل بملف {scores_file}")

# =========================================================
# ألعابك وأوامرك السابقة تتركها هنا كما هي بدون أي تعديل
# طالما أنها تستخدم self.scores_file أو تقرأ وتكتب في "global_points.json"
# =========================================================

# جلب توكن البوت تلقائياً من متغيرات البيئة في Render لتشغيله بأمان
BOT_TOKEN = os.getenv("BOT_TOKEN")

if BOT_TOKEN:
    bot.run(BOT_TOKEN)
else:
    print("خطأ: لم يتم العثور على متغير BOT_TOKEN في إعدادات ريندر! تأكد من إضافته.")