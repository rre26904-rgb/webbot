import discord
from discord.ext import commands

class StopGamesCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="وقف")
    @commands.has_permissions(administrator=True)
    async def stop_specific_games(self, ctx, *files: str):
        """أمر لإيقاف ألعاب محددة باختصار الاسم"""
        
        if not files:
            await ctx.send("⚠️ رجاءً اكتب اسم اللعبة أو الألعاب. (مثال: `!وقف فكك` أو `!وقف فكك عواصم`)")
            return

        msg = await ctx.send("⏳ جاري الإيقاف...")
        success = []
        failed = []

        for file in files:
            # الاختصار الذكي: البوت يضيف _cog تلقائياً إذا لم تكتبها أنت
            target_file = file if file.endswith("_cog") else f"{file}_cog"
            
            # ملاحظة: إذا كانت الملفات داخل مجلد اسمه cogs، استبدل السطر التالي بـ:
            # await self.bot.reload_extension(f"cogs.{target_file}")
            
            try:
                await self.bot.reload_extension(target_file)
                success.append(target_file)
            except commands.ExtensionNotLoaded:
                failed.append(f"{target_file} (غير محمل)")
            except Exception as e:
                failed.append(f"{target_file} (خطأ: {e})")

        # ترتيب الرسالة النهائية
        reply = ""
        if success:
            reply += f"✅ **تم إيقاف وإعادة ضبط:** `{', '.join(success)}`\n"
        if failed:
            reply += f"❌ **لم أتمكن من العثور على:** `{', '.join(failed)}`\n"

        await msg.edit(content=reply)

async def setup(bot):
    await bot.add_cog(StopGamesCog(bot))