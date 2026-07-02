import discord
from discord.ext import commands
import random
from collections import Counter

WORDS_BANK = {
    "حيوانات 🦁": ["أسد", "فيل", "زرافة", "نمر", "قرد", "حصان", "كلب", "قطة", "دب", "ثعلب"],
    "ملابس 👕": ["قميص", "بنطال", "فستان", "حذاء", "قبعة", "معطف", "جورب", "شال", "قفاز", "نظارة"],
    "دول 🗺️": ["السعودية", "مصر", "اليابان", "البرازيل", "فرنسا", "كندا", "الصين", "الهند", "إيطاليا", "إسبانيا"],
    "مدن 🏙️": ["الرياض", "دبي", "باريس", "لندن", "نيويورك", "طوكيو", "القاهرة", "روما", "مدريد", "برلين"],
    "أكلات 🍕": ["بيتزا", "برجر", "سوشي", "شاورما", "كبسة", "باستا", "ستيك", "سلطة", "كيك", "ايسكريم"],
    "كورة ⚽": ["ملعب", "مدرجات", "كأس", "صافرة", "حذاء", "مرمى", "شباك", "راية", "مدافع", "مدرب"]
}

class GameSession:
    def __init__(self, channel, host, players):
        self.channel = channel
        self.host = host
        self.players = players
        self.imposter = random.choice(players)
        self.category = None
        self.topic = None
        self.guess_options = []
        self.turn_index = 0
        self.votes = {} 
        self.is_active = True

    def start(self, category):
        self.category = category
        # إزالة الإيموجي من اسم التصنيف للبحث في القاموس بشكل صحيح إذا لزم الأمر
        clean_category = category
        self.topic = random.choice(WORDS_BANK[clean_category])
        other = [w for w in WORDS_BANK[clean_category] if w != self.topic]
        self.guess_options = random.sample(other, 7) + [self.topic]
        random.shuffle(self.guess_options)

# --- شاشة الفوز النهائية ---
async def send_win_screen(channel, winner_text, description, color, score):
    embed = discord.Embed(title=winner_text, description=description, color=color)
    view = discord.ui.View()
    
    # زر النقاط (شفاف/رمادي مع نجمة)
    score_button = discord.ui.Button(label=f" 𐙚        +{score}", style=discord.ButtonStyle.secondary, disabled=True)
    
    # الزر السحري
    magic_button = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
    async def magic_callback(interaction: discord.Interaction):
        await interaction.response.send_message(
            "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
            ephemeral=True
        )
    magic_button.callback = magic_callback
    
    view.add_item(score_button)
    view.add_item(magic_button)
    
    await channel.send(embed=embed, view=view)


# --- أزرار تخمين الكلمة للشخص اللي برا السالفة ---
class GuessButtons(discord.ui.View):
    def __init__(self, game):
        super().__init__(timeout=60)
        self.game = game
        for word in game.guess_options:
            btn = discord.ui.Button(label=word, style=discord.ButtonStyle.secondary)
            async def callback(i, selected_word=word):
                # التأكد أن اللي يضغط هو المحتال فقط
                if i.user != self.game.imposter:
                    return await i.response.send_message("❌ هذا الزر مخصص للي برا السالفة فقط!", ephemeral=True)
                
                if selected_word == self.game.topic:
                    await i.response.edit_message(view=None)
                    await send_win_screen(
                        self.game.channel, 
                        "🎉 فاز اللي برا السالفة!", 
                        f"{self.game.imposter.mention} عرف السالفة وهي **{self.game.topic}** وخدعكم جميعاً!", 
                        discord.Color.red(), 
                        50
                    )
                else:
                    await i.response.edit_message(view=None)
                    await send_win_screen(
                        self.game.channel, 
                        "🏆 فازوا اللاعبين!", 
                        f"أخطأ {self.game.imposter.mention} في التخمين! السالفة كانت: **{self.game.topic}**.", 
                        discord.Color.green(), 
                        20
                    )
                self.stop()
            btn.callback = callback
            self.add_item(btn)


# --- لوحة اللعبة النشطة (معرفة السالفة والتصويت) ---
class GameView(discord.ui.View):
    def __init__(self, game):
        super().__init__(timeout=None)
        self.game = game

    @discord.ui.button(label="📜 وش السالفة؟", style=discord.ButtonStyle.primary)
    async def show_topic(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user not in self.game.players:
            return await interaction.response.send_message("❌ أنت لست مشاركاً في هذه اللعبة!", ephemeral=True)

        if interaction.user == self.game.imposter:
            await interaction.response.send_message("🕵️ أنت برا السالفة! حاول تندمج معهم ولا تكشف نفسك.", ephemeral=True)
        else:
            await interaction.response.send_message(f"📖 السالفة هي: **{self.game.topic}**\n(التصنيف: {self.game.category})", ephemeral=True)

    @discord.ui.button(label="🗳️ تصويت الإقصاء", style=discord.ButtonStyle.danger)
    async def vote(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user not in self.game.players:
            return await interaction.response.send_message("❌ أنت لست مشاركاً في هذه اللعبة!", ephemeral=True)
            
        if interaction.user.id in self.game.votes:
            return await interaction.response.send_message("⚠️ لقد قمت بالتصويت مسبقاً!", ephemeral=True)

        view = discord.ui.View()
        options = [discord.SelectOption(label=p.display_name, value=str(p.id)) for p in self.game.players]
        select = discord.ui.Select(placeholder="🔍 اختر المشتبه به...", options=options)
        
        async def select_callback(i):
            self.game.votes[i.user.id] = int(select.values[0])
            await i.response.send_message("✅ تم تسجيل صوتك بنجاح.", ephemeral=True)
            await i.message.edit(view=None) # إخفاء قائمة التصويت بعد الاختيار
            
            # إذا اكتمل التصويت
            if len(self.game.votes) == len(self.game.players):
                # تعطيل أزرار اللعبة الأساسية
                for child in self.children:
                    child.disabled = True
                await interaction.message.edit(view=self)
                await self.tally(i)
        
        select.callback = select_callback
        view.add_item(select)
        
        embed = discord.Embed(title="🗳️ وقت التصويت", description="صوتوا للشخص اللي تعتقدون أنه برا السالفة (كل شخص له صوت واحد):", color=discord.Color.orange())
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def tally(self, i):
        # حساب الأصوات
        most_voted_id = Counter(self.game.votes.values()).most_common(1)[0][0]
        
        if most_voted_id == self.game.imposter.id:
            embed = discord.Embed(
                title="🚨 تم كشف اللي برا السالفة!",
                description=f"اللاعبون كشفوا {self.game.imposter.mention}! \nالآن فرصتك الأخيرة يا {self.game.imposter.mention}.. خمن السالفة الصحيحة لتفوز:",
                color=discord.Color.yellow()
            )
            await self.game.channel.send(embed=embed, view=GuessButtons(self.game))
        else:
            await send_win_screen(
                self.game.channel, 
                "🎉 فاز اللي برا السالفة!", 
                f"اللاعبون صوتوا بشكل خاطئ! اللي برا السالفة كان {self.game.imposter.mention} ونجح في خداعكم.\nالسالفة كانت: **{self.game.topic}**", 
                discord.Color.red(), 
                50
            )


# --- لوبي الدخول التفاعلي ---
class LobbyView(discord.ui.View):
    def __init__(self, host):
        super().__init__(timeout=30.0) # وقت الدخول 30 ثانية
        self.host = host
        self.players = [host]
        self.message = None

        # إضافة الزر السحري في اللوبي
        magic_button = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
        async def magic_callback(interaction: discord.Interaction):
            await interaction.response.send_message(
                "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
                ephemeral=True
            )
        magic_button.callback = magic_callback
        self.add_item(magic_button)

    @discord.ui.button(label="انضمام للعبة 🎮", style=discord.ButtonStyle.success, row=0)
    async def join(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user in self.players:
            return await interaction.response.send_message("❌ أنت منضم بالفعل للعبة!", ephemeral=True)
            
        self.players.append(interaction.user)
        
        # تحديث الإيمبد لترتيب المنضمين
        embed = self.message.embeds[0]
        players_list = "\n".join([f"**{i+1}.** 👤 {p.mention}" for i, p in enumerate(self.players)])
        embed.description = f"**اضغط على الزر للانضمام! (تحتاج اللعبة 3 لاعبين كحد أدنى)**\n\n**اللاعبون المنضمون ({len(self.players)}):**\n{players_list}"
        
        await interaction.response.edit_message(embed=embed)

    async def on_timeout(self):
        if not self.message: return
        
        # قفل الدخول (تعطيل الأزرار)
        for child in self.children:
            child.disabled = True
        try:
            await self.message.edit(view=self)
        except:
            pass

        # التحقق من عدد اللاعبين
        if len(self.players) < 3: # يمكنك تغييرها إلى 2 للتجارب
            embed = discord.Embed(title="❌ تم الإلغاء", description="لم يكتمل العدد المطلوب لبدء اللعبة (الأقل 3 لاعبين).", color=discord.Color.red())
            await self.message.channel.send(embed=embed)
        else:
            game = GameSession(self.message.channel, self.host, self.players)
            
            # منيو اختيار التصنيف للهوست فقط
            view = discord.ui.View()
            select = discord.ui.Select(placeholder="📂 اختر تصنيف اللعبة...", options=[discord.SelectOption(label=c, value=c) for c in WORDS_BANK.keys()])
            
            async def cat_callback(i):
                if i.user != self.host:
                    return await i.response.send_message("❌ صاحب اللعبة فقط من يمكنه اختيار التصنيف!", ephemeral=True)
                
                game.start(select.values[0])
                
                start_embed = discord.Embed(
                    title="🕵️ بدأت لعبة برا السالفة!",
                    description=f"التصنيف المختار: **{select.values[0]}**\n\nاضغط على 'وش السالفة؟' لمعرفة الكلمة، وتناقشوا عشان تعرفون مين اللي برا السالفة!",
                    color=discord.Color.blurple()
                )
                await i.response.edit_message(content=None, embed=start_embed, view=GameView(game))
            
            select.callback = cat_callback
            view.add_item(select)
            
            embed_cat = discord.Embed(title="⚙️ اختيار التصنيف", description=f"يا {self.host.mention}، العدد اكتمل! اختر تصنيف اللعبة من القائمة بالأسفل لبدء اللعب:", color=discord.Color.gold())
            await self.message.channel.send(embed=embed_cat, view=view)


# --- الكوج الأساسي ---
class SalfaCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="سالفة", aliases=["برا_السالفة"])
    async def start_salfa(self, ctx):
        embed = discord.Embed(
            title="🕵️‍♂️ لعبة برا السالفة",
            description=f"**اضغط على الزر للانضمام! (تحتاج اللعبة 3 لاعبين كحد أدنى)**\n\n**اللاعبون المنضمون (1):**\n**1.** 👤 {ctx.author.mention}",
            color=discord.Color.teal()
        )
        embed.set_footer(text="ينتهي وقت الدخول بعد 30 ثانية ⏳")
        
        view = LobbyView(ctx.author)
        view.message = await ctx.send(embed=embed, view=view)

async def setup(bot):
    await bot.add_cog(SalfaCog(bot))