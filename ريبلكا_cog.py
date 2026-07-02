import discord
from discord.ext import commands
import random
import asyncio

class ReplikaGame:
    def __init__(self, ctx):
        self.ctx = ctx
        self.players = []

# --- كلاس اللوبي (شاشة التسجيل التفاعلية) ---
class RegisterView(discord.ui.View):
    def __init__(self, game):
        super().__init__(timeout=30.0) # وقت التسجيل 30 ثانية
        self.game = game
        self.message = None # سيتم تحديثه لاحقاً بالرسالة المبعوثة

        # الزر السحري للدعم (موجود في اللوبي)
        magic_button = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
        async def magic_callback(interaction: discord.Interaction):
            await interaction.response.send_message(
                "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
                ephemeral=True
            )
        magic_button.callback = magic_callback
        self.add_item(magic_button)

    @discord.ui.button(label="تسجيل الدخول 🕹️", style=discord.ButtonStyle.blurple, row=0)
    async def join_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        # التحقق إذا كان اللاعب مسجل مسبقاً
        if interaction.user in self.game.players:
            return await interaction.response.send_message("❌ أنت مسجل بالفعل يا غالي!", ephemeral=True)
        
        # إضافة اللاعب للقائمة
        self.game.players.append(interaction.user)
        
        # تحديث الإيمبد لإظهار المسجلين الجدد
        embed = self.message.embeds[0]
        players_list = "\n".join([f"👤 {p.mention}" for p in self.game.players])
        embed.description = f"**اضغط على الزر أدناه للمشاركة.**\n\n**المسجلين الآن ({len(self.game.players)}):**\n{players_list}"
        
        await interaction.response.edit_message(embed=embed)

    async def on_timeout(self):
        # تعطيل الأزرار بعد انتهاء الوقت
        for item in self.children:
            item.disabled = True
        if self.message:
            try:
                await self.message.edit(view=self)
            except:
                pass


# --- الكوج الأساسي للعبة ---
class ReplikaCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.active_games = {}
        self.letters = ["أ", "ب", "ت", "ج", "ح", "خ", "د", "ر", "ز", "س", "ش", "ص", "ط", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "هـ", "و", "ي"]
        self.categories = ["اسم 🧑", "حيوان 🦁", "نبات 🌿", "جماد 📦", "دولة 🗺️"]

    @commands.command(name="ريبلكا", aliases=["replika"])
    async def start_replika(self, ctx):
        if ctx.channel.id in self.active_games:
            return await ctx.send("❌ توجد مباراة ريبلكا قائمة بالفعل في هذا الروم!")

        game = ReplikaGame(ctx)
        self.active_games[ctx.channel.id] = game

        # إيمبد البداية والتسجيل
        embed = discord.Embed(
            title="🎮  ريبلكا  🎮",
            description="**اضغط على الزر أدناه للمشاركة.**\n\n**المسجلين الآن (0):**\nلا يوجد أحد بعد، كن الأول!",
            color=discord.Color.teal()
        )
        
        view = RegisterView(game)
        view.message = await ctx.send(embed=embed, view=view)
        
        # انتظار انتهاء وقت التسجيل
        await asyncio.sleep(30)
        
        if len(game.players) < 2:
            del self.active_games[ctx.channel.id]
            return await ctx.send("❌ تم إلغاء اللعبة: يجب توفر لاعبين على الأقل لبدء التحدي.")

        active_players = list(game.players)
        await ctx.send("🏁 **انتهى التسجيل.. بدأت المباراة! استعدوا 🔥**")
        await asyncio.sleep(2)

        round_num = 1
        while len(active_players) > 1:
            current_letter = random.choice(self.letters)
            await ctx.send(f"🏹 **الجولة {round_num}** | الحرف المختار: **[{current_letter}]**")
            await asyncio.sleep(2)

            for category in self.categories:
                if len(active_players) <= 1: break
                
                # خلط اللاعبين لاختيار دور جديد عشوائي لكل قسم
                random.shuffle(active_players)
                target_player = active_players[0]
                
                await ctx.send(f"🚨 {target_player.mention} الدور عليك! أرسل **{category}** يبدأ بحرف **({current_letter})** (معاك 15 ثانية)")

                def check_reply(m):
                    return m.author.id == target_player.id and m.channel.id == ctx.channel.id

                try:
                    msg = await self.bot.wait_for("message", check=check_reply, timeout=15.0)
                    content = msg.content.strip()
                    
                    # فحص ذكي للألف والهمزات
                    alif = ["أ", "ا", "إ", "آ"]
                    is_correct = (content.startswith(current_letter)) or (current_letter in alif and content[0] in alif)

                    if is_correct:
                        await ctx.send(f"✅ صح! نجا {target_player.mention}.")
                    else:
                        await ctx.send(f"❌ الكلمة خطأ! تم إقصاء {target_player.mention} من اللعبة.")
                        active_players.remove(target_player)
                
                except asyncio.TimeoutError:
                    await ctx.send(f"💥 انتهى الوقت! تم إقصاء {target_player.mention} لعدم الرد.")
                    active_players.remove(target_player)
                
                await asyncio.sleep(1)
            
            round_num += 1

        # --- شاشة الفوز (تطبيق طلبك هنا) ---
        if len(active_players) == 1:
            winner = active_players[0]
            new_score = 50 # يمكنك ربطها بقاعدة البيانات الخاصة بك لاحقاً إذا كان عندك نظام نقاط
            
            win_embed = discord.Embed(
                title="",
                description=f"{winner.mention} فاز في اللعبة وكان آخر الصامدين!",
                color=discord.Color.green()
            )

            win_view = discord.ui.View()
            
            # زر النقاط (شفاف/رمادي مع نجمة)
            score_button = discord.ui.Button(
                label=f" 𐙚        +{new_score}",
                style=discord.ButtonStyle.secondary,
                disabled=True,
            )

            # الزر السحري (للدعم)
            magic_button = discord.ui.Button(
                label="⋆. 𐙚 ˚",
                style=discord.ButtonStyle.secondary  
            )

            # الدالة اللي تتنفذ لما ينضغط الزر السحري
            async def win_magic_callback(interaction: discord.Interaction):
                await interaction.response.send_message(
                    "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
                    ephemeral=True 
                )
            
            # ربط الدالة بالزر
            magic_button.callback = win_magic_callback

            # إضافة الأزرار للرسالة
            win_view.add_item(score_button)
            win_view.add_item(magic_button)

            await ctx.send(embed=win_embed, view=win_view)
        
        # تنظيف اللعبة من القاموس بعد الانتهاء
        if ctx.channel.id in self.active_games:
            del self.active_games[ctx.channel.id]

async def setup(bot):
    await bot.add_cog(ReplikaCog(bot))