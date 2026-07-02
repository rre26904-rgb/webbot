import discord
from discord.ext import commands
import json
import os

class PointsCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.scores_file = "global_points.json" # ملف النقاط الموحد

    # دالة لقراءة النقاط من الملف
    def get_points(self, user_id):
        if os.path.exists(self.scores_file):
            with open(self.scores_file, "r", encoding="utf-8") as f:
                try:
                    scores = json.load(f)
                    return scores.get(str(user_id), 0)
                except json.JSONDecodeError:
                    return 0
        return 0

    # دالة لإنشاء الأزرار بشكل متكرر ونظيف
    def create_points_ui(self, points):
        view = discord.ui.View()
        
        # 1. زر النقاط (شفاف/رمادي مع نجمة)
        score_button = discord.ui.Button(
            label=f" 𐙚        {points}",
            style=discord.ButtonStyle.secondary,
            disabled=True
        )
        
        # 2. الزر السحري (للدعم)
        magic_button = discord.ui.Button(
            label="⋆. 𐙚 ˚",
            style=discord.ButtonStyle.secondary  
        )
        
        async def magic_callback(interaction: discord.Interaction):
            await interaction.response.send_message(
                "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
                ephemeral=True
            )
        magic_button.callback = magic_callback
        
        # 3. زر الموقع (أزرار الروابط تكون شفافة/رمادية تلقائياً في ديسكورد)
        website_button = discord.ui.Button(
            label="🌐 الموقع",
            url="https://webbot-pmtn.onrender.com", # رابط موقعك
            style=discord.ButtonStyle.link
        )
        
        # إضافة الأزرار للواجهة
        view.add_item(score_button)
        view.add_item(magic_button)
        view.add_item(website_button)
        
        return view

    
    @commands.command(name="نقاط", aliases=["نقاطي", "رصيدي", "points"])
    async def check_points_cmd(self, ctx, member: discord.Member = None):
        member = member or ctx.author 
        points = self.get_points(member.id)
        
        # إيمبد أسود وبدون عنوان
        embed = discord.Embed(color=0x000000) 
        embed.set_thumbnail(url=member.display_avatar.url)
        
        if member == ctx.author:
            embed.description = f"أهلاً {member.mention}، رصيد نقاطك الحالي في الألعاب هو: **{points}** نقطة 🌟"
        else:
            embed.description = f"رصيد نقاط {member.mention} في الألعاب هو: **{points}** نقطة 🌟"
            
        # استدعاء الأزرار
        view = self.create_points_ui(points)
        await ctx.send(embed=embed, view=view)


    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return
            
        if message.content.strip() == "نقاطي":
            points = self.get_points(message.author.id)
            
            # إيمبد أسود وبدون عنوان
            embed = discord.Embed(
                description=f"أهلاً {message.author.mention}، رصيد نقاطك الحالي في الألعاب هو: **{points}** نقطة 🌟",
                color=0x000000
            )
            embed.set_thumbnail(url=message.author.display_avatar.url)
            
            # استدعاء الأزرار
            view = self.create_points_ui(points)
            await message.channel.send(embed=embed, view=view)

async def setup(bot):
    await bot.add_cog(PointsCog(bot))