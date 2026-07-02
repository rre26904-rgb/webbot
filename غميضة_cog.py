import discord
from discord.ext import commands
import random
import asyncio
import json
import os

# --- كلاس لوحة التسجيل التفاعلية (اللوبي) ---
class HideSeekJoinView(discord.ui.View):
    def __init__(self, game):
        super().__init__(timeout=30.0)  # وقت التسجيل 30 ثانية
        self.game = game
        self.message = None

        # إضافة الزر السحري للدعم الفني بجانب زر الانضمام
        magic_button = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
        async def magic_callback(interaction: discord.Interaction):
            await interaction.response.send_message(
                "👋 أهلاً بك! هذا سيرفر الدعم الفني الخاص بنا. حياك الله:\nhttps://discord.gg/zkJpxjk2rN", 
                ephemeral=True
            )
        magic_button.callback = magic_callback
        self.add_item(magic_button)

    @discord.ui.button(label="انضمام للعبة 🏃", style=discord.ButtonStyle.green, row=0)
    async def join(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user in self.game["players"]:
            return await interaction.response.send_message("❌ أنت منضم بالفعل للعبة يا غالي!", ephemeral=True)
        
        # إضافة اللاعب للعبة
        self.game["players"][interaction.user] = None
        
        # تحديث الإيمبد بشكل تفاعلي وفوري بأسماء المشتركين
        embed = self.message.embeds[0]
        players_list = "\n".join([f"👤 {p.mention}" for p in self.game["players"]])
        embed.description = f"**اضغطوا على الزر أدناه للانضمام! تحتاج اللعبة إلى لاعبين على الأقل للبدء.**\n\n**اللاعبون المنضمون حالياً ({len(self.game['players'])}):**\n{players_list}"
        
        await interaction.response.edit_message(embed=embed)

    async def on_timeout(self):
        for item in self.children:
            item.disabled = True
        if self.message:
            try:
                await self.message.edit(view=self)
            except:
                pass


# --- كلاس المنيو (القائمة المنسدلة) للبحث عن الأماكن ---
class SpotDropdown(discord.ui.Select):
    def __init__(self, spots):
        options = [
            discord.SelectOption(label=spot, description=f"البحث في {spot}", value=spot) 
            for spot in spots
        ]
        super().__init__(placeholder="🔍 اختر مكاناً للبحث فيه والتخمين...", min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        view: SeekerSearchView = self.view
        
        # التحقق أن من يضغط هو الصياد فقط
        if interaction.user != view.seeker:
            return await interaction.response.send_message("❌ لست أنت الصياد في هذه اللعبة! انتظر دورك.", ephemeral=True)

        current_game = view.cog.active_games.get(view.channel_id)
        if not current_game:
            return

        chosen_spot = self.values[0]
        
        # التحقق إذا كان المكان قد تم البحث فيه مسبقاً
        if chosen_spot in view.searched_spots:
            return await interaction.response.send_message("⚠️ لقد بحثت في هذا المكان سابقاً، اختر مكاناً آخر!", ephemeral=True)

        # إضافة المكان لقائمة الأماكن المبحوث عنها
        view.searched_spots.append(chosen_spot)

        # البحث عن لاعب يختبئ في هذا المكان
        found_player = None
        for p, s in current_game["players"].items():
            if p != view.seeker and s == chosen_spot:
                found_player = p
                break

        if found_player:
            # إقصاء اللاعب بعد كشفه
            del current_game["players"][found_player]
            
            # تحديث الإيمبد لمتابعة الحالة والأماكن التي تم تفتيشها
            embed = interaction.message.embeds[0]
            embed.add_field(name="📍 نتيجة البحث الحالية", value=f"🔥 كفو! الصياد وجد {found_player.mention} في **{chosen_spot}**!", inline=False)
            
            # التحقق من بقاء لاعبين مختبئين
            remaining_players = [p for p in current_game["players"] if p != view.seeker]
            
            if len(remaining_players) == 0:
                # الصياد وجد الجميع وفاز!
                new_score = view.cog.add_score(view.seeker.id)
                
                embed_win = discord.Embed(
                    title="🏆 نــهــايــة الــلــعــبــة | فوز الصياد!",
                    description=f"لقد نجح الصياد الماهر {view.seeker.mention} في العثور على جميع المختبئين بنجاح! 🔥",
                    color=discord.Color.green()
                )
                
                # إنشاء فيو شاشة الفوز النهائية مع الأزرار المطلوبة
                win_view = discord.ui.View()
                score_btn = discord.ui.Button(label=f" 𐙚        +{new_score}", style=discord.ButtonStyle.secondary, disabled=True)
                magic_btn = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
                
                async def win_magic(inter):
                    await inter.response.send_message("👋 سيرفر الدعم الفني الخاص بنا حياك الله:\nhttps://discord.gg/zkJpxjk2rN", ephemeral=True)
                magic_btn.callback = win_magic
                
                win_view.add_item(score_btn)
                win_view.add_item(magic_btn)
                
                await interaction.response.edit_message(embed=embed_win, view=None)
                await interaction.channel.send(embed=embed_win, view=win_view)
                view.stop()
                view.clean_game()
                return
            else:
                await interaction.response.edit_message(embed=embed, view=view)
        else:
            # المكان فارغ
            embed = interaction.message.embeds[0]
            # تحديث الأماكن المستبعدة في الإيمبد لسهولة اللعب
            embed.set_footer(text=f"الأماكن المستبعدة حتى الآن: {', '.join(view.searched_spots)}")
            await interaction.response.send_message(f"💨 بحثت في **{chosen_spot}** لكنه كان فارغاً تماماً.. حاول مجدداً!", ephemeral=True)
            await interaction.message.edit(embed=embed, view=view)


# --- كلاس الفيو الخاص بالصياد وقائمة الأماكن المنسدلة ---
class SeekerSearchView(discord.ui.View):
    def __init__(self, cog, channel_id, seeker_obj, total_spots):
        super().__init__(timeout=45.0)  # وقت البحث 45 ثانية
        self.cog = cog
        self.channel_id = channel_id
        self.seeker = seeker_obj
        self.message_obj = None
        self.searched_spots = []

        # إضافة المنيو (القائمة المنسدلة) للفيو
        self.add_item(SpotDropdown(total_spots))

    def clean_game(self):
        self.cog.bot.global_game_lock.discard(self.channel_id)
        if self.channel_id in self.cog.active_games:
            del self.cog.active_games[self.channel_id]

    async def on_timeout(self):
        # في حال انتهى الوقت دون كشف الجميع يفوز المختبئون
        current_game = self.cog.active_games.get(self.channel_id)
        if current_game:
            remaining_players = [p for p in current_game["players"] if p != self.seeker]
            if len(remaining_players) > 0:
                winners_mentions = ", ".join([p.mention for p in remaining_players])
                
                # توزيع النقاط على الناجين الصامدين
                for p in remaining_players:
                    self.cog.add_score(p.id)

                embed_timeout = discord.Embed(
                    title="⏳ انتهى وقت البحث وحصلت الإقالة!",
                    description=f"انتصر اللاعبون الصامدون والاختباء كان أسطورياً! 🕵️‍♂️\n🏆 الفائزون: {winners_mentions}",
                    color=discord.Color.red()
                )
                
                win_view = discord.ui.View()
                score_btn = discord.ui.Button(label=" 𐙚        الصامدون +1", style=discord.ButtonStyle.secondary, disabled=True)
                magic_btn = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
                
                async def win_magic(inter):
                    await inter.response.send_message("👋 سيرفر الدعم الفني الخاص بنا حياك الله:\nhttps://discord.gg/zkJpxjk2rN", ephemeral=True)
                magic_btn.callback = win_magic
                
                win_view.add_item(score_btn)
                win_view.add_item(magic_btn)
                
                if self.message_obj:
                    try:
                        await self.message_obj.edit(view=None)
                        await self.message_obj.channel.send(embed=embed_timeout, view=win_view)
                    except:
                        pass
        self.clean_game()


# --- الكوج الأساسي للعبة ---
class HideSeekCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.scores_file = "global_points.json"
        self.active_games = {}
        
        # زيادة وتوسيع الأماكن بشكل منوع وممتع وجميل
        self.spots = [
            "السطح 🏢", "القبو 🚪", "خلف الشجرة 🌳", "تحت السرير 🛏️", 
            "الخزانة 🧥", "خلف الستارة 🎭", "الحديقة 🌻", "المطبخ 🍽️",
            "تحت الطاولة 🪑", "داخل الصندوق 📦", "خلف الأريكة 🛋️", "المستودع السري 🏪",
            "في السيارة 🚗", "خلف البرميل 🛢️", "تحت الدرج 🪜"
        ]

        if not hasattr(self.bot, 'global_game_lock'):
            self.bot.global_game_lock = set()

    def add_score(self, user_id):
        if os.path.exists(self.scores_file):
            with open(self.scores_file, "r", encoding="utf-8") as f:
                try:
                    scores = json.load(f)
                except json.JSONDecodeError:
                    scores = {}
        else:
            scores = {}
        
        user_id_str = str(user_id)
        scores[user_id_str] = scores.get(user_id_str, 0) + 1
        
        with open(self.scores_file, "w", encoding="utf-8") as f:
            json.dump(scores, f, ensure_ascii=False, indent=4)
            
        return scores[user_id_str]

    @commands.command(name="لعبة_الاختباء", aliases=["تخبي"])
    async def start_hide_cmd(self, ctx):
        await self.run_game(ctx)

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot:
            return
        if message.content.strip() in ["تخبي", "لعبة_الاختباء"]:
            ctx = await self.bot.get_context(message)
            await self.run_game(ctx)

    async def run_game(self, ctx):
        if ctx.channel.id in self.bot.global_game_lock:
            return await ctx.send("⚠️ هناك لعبة جارية بالفعل في هذا الروم! انتظر حتى تنتهي.")

        self.bot.global_game_lock.add(ctx.channel.id)
        game = {"players": {}, "started": False}
        self.active_games[ctx.channel.id] = game

        embed = discord.Embed(
            title="🕵️‍♂️ لعبة الاختباء الكبرى 🕵️‍♂️", 
            description="**اضغطوا على الزر أدناه للانضمام! تحتاج اللعبة إلى لاعبين على الأقل للبدء.**\n\n**اللاعبون المنضمون حالياً (0):**\nلا يوجد أحد، كن أول المختبئين!", 
            color=discord.Color.blurple()
        )
        
        join_view = HideSeekJoinView(game)
        join_view.message = await ctx.send(embed=embed, view=join_view)
        
        await asyncio.sleep(30)  # انتظار وقت التسجيل كاملاً

        if len(game["players"]) < 2:
            await ctx.send("❌ تم إلغاء اللعبة لعدم توفر عدد كافٍ من اللاعبين (تحتاج لاعبين على الأقل).")
            self.bot.global_game_lock.discard(ctx.channel.id)
            if ctx.channel.id in self.active_games:
                del self.active_games[ctx.channel.id]
            return

        # اختيار الصياد عشوائياً
        seeker = random.choice(list(game["players"].keys()))
        game["seeker"] = seeker
        await ctx.send(f"🚨 **تم اختيار الصياد:** {seeker.mention}!\nباقي اللاعبين، تفقدوا الخاص الآن لتلقي مكان اختبائكم السري. معكم 15 ثانية للتأهب!")

        # توزيع أماكن عشوائية فريدة للمختبئين بالخاص
        for p in list(game["players"].keys()):
            if p != seeker:
                spot = random.choice(self.spots)
                game["players"][p] = spot
                try:
                    await p.send(f"🤫 مكانك السري المختار للاختباء هو: **{spot}**. الزم الهدوء ولا تخبر الصياد!")
                except:
                    pass

        await asyncio.sleep(15)

        # تجهيز إيمبد البحث المخصص للصياد
        search_embed = discord.Embed(
            title="🔍 جولة البحث والتفتيش بدأت!",
            description=f"يا صياد {seeker.mention}، استخدم القائمة المنسدلة بالأسفل لاختيار الأماكن التي تظن أن اللاعبين يختبئون بها.\n**معك 45 ثانية فقط لكشف الجميع!**",
            color=discord.Color.orange()
        )

        search_view = SeekerSearchView(self, ctx.channel.id, seeker, self.spots)
        search_msg = await ctx.send(embed=search_embed, view=search_view)
        search_view.message_obj = search_msg


async def setup(bot):
    await bot.add_cog(HideSeekCog(bot))