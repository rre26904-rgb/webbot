import discord
from discord.ext import commands

class StopGamesCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="وقف")
    @commands.has_permissions(administrator=True)
    async def stop_all_games(self, ctx):
        """أمر لإيقاف جميع الألعاب الفعالة عبر إعادة تحميل ملفات _cog"""
        try:
            msg = await ctx.send("⏳ جاري إيقاف الألعاب...")
            
            reloaded_count = 0
            # جلب كل الملفات المحملة في البوت حالياً
            for extension in list(self.bot.extensions.keys()):
                # التحقق إذا كان اسم الملف ينتهي بـ _cog
                if extension.endswith("_cog"):
                    await self.bot.reload_extension(extension)
                    reloaded_count += 1
            
            if reloaded_count > 0:
                await msg.edit(content=f"✅ **تم إيقاف جميع الألعاب الفعالة بنجاح!** (تمت إعادة ضبط {reloaded_count} ملف)")
            else:
                await msg.edit(content="⚠️ لم أجد أي ملفات ألعاب محملة تنتهي بـ `_cog`.")
                
        except Exception as e:
            await ctx.send(f"❌ حدث خطأ أثناء إيقاف الألعاب:\n```py\n{e}\n```")

async def setup(bot):
    await bot.add_cog(StopGamesCog(bot))