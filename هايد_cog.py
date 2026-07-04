import discord
from discord.ext import commands
import random
import asyncio

# --- شاشة الفوز النهائية ---
async def send_hide_win_screen(channel, winner, most_catches_user, top_score, survivor_win=True):
    if survivor_win:
        title = "🏆 الفائز الأخير (الصامد) 🏆"
        desc = f"**{winner.mention}** هو الوحيد اللي ما أحد قدر يصيده! فاز على الجميع وفاز باللعبة! 🔥"
    else:
        title = "🎯 أفضل صياد 🎯"
        desc = f"**{winner.mention}** فاز باللعبة لأنه صاد آخر شخص!"

    if most_catches_user and top_score > 0:
        desc += f"\n\n🎖️ **أفضل صياد في الجولة:** {most_catches_user.mention} (صاد {top_score})"

    embed = discord.Embed(title=title, description=desc, color=discord.Color.green())
    view = discord.ui.View()
    
    # زر النقاط (شفاف/رمادي مع نجمة)
    score_button = discord.ui.Button(label=" 𐙚        +50", style=discord.ButtonStyle.secondary, disabled=True)
    
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


# --- لوحة الـ 25 زر (تُستخدم للتخبي وللبحث) ---
class Grid25View(discord.ui.View):
    def __init__(self, is_hiding_phase=False, game_state=None):
        super().__init__(timeout=None)
        self.is_hiding_phase = is_hiding_phase
        self.game_state = game_state # مرجع لمعلومات اللعبة

        # إنشاء 25 زر في 5 صفوف (أقصى حد للديسكورد)
        for i in range(1, 26):
            btn = discord.ui.Button(
                label=str(i), 
                style=discord.ButtonStyle.secondary, 
                row=(i-1)//5, 
                custom_id=f"spot_{i}"
            )
            if self.is_hiding_phase:
                btn.callback = self.hide_callback
            self.add_item(btn)

    async def hide_callback(self, interaction: discord.Interaction):
        if interaction.user not in self.game_state['players']:
            return await interaction.response.send_message("❌ أنت لست مشاركاً في هذه اللعبة!", ephemeral=True)
            
        spot = int(interaction.data["custom_id"].split("_")[1])
        self.game_state['hiding_spots'][interaction.user.id] = spot
        
        await interaction.response.send_message(f"🤫 تم تسجيل مكانك بنجاح في الزر رقم **{spot}**! انتظر بدء الصيد.", ephemeral=True)


# --- لوبي الدخول ---
class HideLobbyView(discord.ui.View):
    def __init__(self, ctx):
        super().__init__(timeout=30.0) # 30 ثانية للتسجيل
        self.ctx = ctx
        self.players = [ctx.author]
        self.message = None

        magic_button = discord.ui.Button(label="⋆. 𐙚 ˚", style=discord.ButtonStyle.secondary)
        async def magic_callback(interaction: discord.Interaction):
            await interaction.response.send_message("👋 سيرفر الدعم الفني الخاص بنا حياك الله:\nhttps://discord.gg/zkJpxjk2rN", ephemeral=True)
        magic_button.callback = magic_callback
        self.add_item(magic_button)

    @discord.ui.button(label="انضمام للعبة 🏃‍♂️", style=discord.ButtonStyle.success, row=0)
    async def join(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user in self.players:
            return await interaction.response.send_message("❌ أنت مسجل بالفعل يا غالي!", ephemeral=True)
            
        self.players.append(interaction.user)
        embed = self.message.embeds[0]
        players_list = "\n".join([f"**{i+1}.** 👤 {p.mention}" for i, p in enumerate(self.players)])
        embed.description = f"**اضغط للانضمام! (25 زر، والناجي الأخير يفوز)**\n\n**اللاعبون ({len(self.players)}):**\n{players_list}"
        await interaction.response.edit_message(embed=embed)


# --- الكوج الأساسي والمحرك للعبة ---
class HideGameCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="هايد")
    async def start_hide25(self, ctx):
        # 1. إرسال اللوبي
        embed = discord.Embed(
            title="🕵️‍♂️ لعبة هايد 🕵️‍♂️",
            description=f"**اضغط للانضمام! (25 زر، والناجي الأخير يفوز)**\n\n**اللاعبون (1):**\n**1.** 👤 {ctx.author.mention}",
            color=discord.Color.blue()
        )
        embed.set_footer(text="يقفل الدخول بعد 30 ثانية ⏳")
        
        lobby = HideLobbyView(ctx)
        lobby.message = await ctx.send(embed=embed, view=lobby)
        
        await asyncio.sleep(30)
        
        # قفل اللوبي
        for child in lobby.children:
            child.disabled = True
        try:
            await lobby.message.edit(view=lobby)
        except:
            pass

        players = lobby.players
        if len(players) < 2:
            return await ctx.send("❌ تم الإلغاء.. العدد غير كافٍ (تحتاج 2 الأقل).")

        # 2. مرحلة التخبي
        game_state = {
            'players': players,
            'hiding_spots': {}, # id -> spot_number
            'scores': {p.id: 0 for p in players}
        }

        hide_embed = discord.Embed(
            title="🤫 مرحلة التخبي",
            description="الكل يختار له زر يتخبى فيه! معكم **20 ثانية**.\n(اللي ما يختار بينحط عشوائي)",
            color=discord.Color.dark_gray()
        )
        hide_view = Grid25View(is_hiding_phase=True, game_state=game_state)
        hide_msg = await ctx.send(embed=hide_embed, view=hide_view)

        await asyncio.sleep(20) # وقت التخبي

        # إعطاء أماكن عشوائية للي ما اختاروا
        for p in players:
            if p.id not in game_state['hiding_spots']:
                available = [i for i in range(1, 26)]
                game_state['hiding_spots'][p.id] = random.choice(available)

        # تعطيل أزرار التخبي
        for child in hide_view.children:
            child.disabled = True
        await hide_msg.edit(content="⏳ **انتهى وقت التخبي! جاري تجهيز مرحلة الصيد...**", view=hide_view)
        await asyncio.sleep(2)

        # 3. مرحلة الصيد
        alive_players = players.copy()
        turn_idx = 0
        
        seek_view = Grid25View(is_hiding_phase=False)
        seek_msg = await ctx.send("🔍 **بدأت مرحلة الصيد! الأزرار جاهزة:**", view=seek_view)
        status_msg = await ctx.send("جاري التحميل...")

        # حلقة الأدوار
        while len(alive_players) > 1:
            current_player = alive_players[turn_idx]
            
            await status_msg.edit(content=f"🚨 الدور على: {current_player.mention} | معاك **15 ثانية** تطق زر وتصيد!")

            def check(interaction):
                return (
                    interaction.user == current_player and 
                    interaction.message.id == seek_msg.id and 
                    interaction.data["custom_id"].startswith("spot_")
                )

            try:
                # انتظار ضغطة الزر من اللاعب الحالي لمدة 15 ثانية
                interaction = await self.bot.wait_for('interaction', timeout=15.0, check=check)
                
                spot_clicked = int(interaction.data["custom_id"].split("_")[1])
                btn_index = spot_clicked - 1
                clicked_btn = seek_view.children[btn_index]

                # التحقق إذا كان في أحد متخبي هنا (باستثناء اللاعب نفسه)
                found_user_id = None
                for uid, user_spot in game_state['hiding_spots'].items():
                    if user_spot == spot_clicked and uid != current_player.id and uid in [p.id for p in alive_players]:
                        found_user_id = uid
                        break

                if found_user_id:
                    # ✅ صاد شخص!
                    found_member = discord.utils.get(alive_players, id=found_user_id)
                    game_state['scores'][current_player.id] += 1
                    
                    clicked_btn.style = discord.ButtonStyle.success
                    clicked_btn.disabled = True
                    
                    await interaction.response.edit_message(view=seek_view)
                    await ctx.send(f"🔥 **كفووو!** {current_player.mention} كشف مكان {found_member.mention} بالزر رقم {spot_clicked}! (تم الإقصاء)")
                    
                    # إزالة اللاعب المكشوف وضبط ترتيب الأدوار
                    target_idx = alive_players.index(found_member)
                    alive_players.remove(found_member)
                    if target_idx < turn_idx:
                        turn_idx -= 1 # عشان ما نتخطى دور أحد بالغلط
                        
                else:
                    # ❌ فاضي (تعديل الانتقال الفوري)
                    clicked_btn.style = discord.ButtonStyle.danger
                    clicked_btn.label = "✖"
                    clicked_btn.disabled = True
                    
                    # تحديث الأزرار مباشرة ليظهر الإكس فوراً
                    await interaction.response.edit_message(view=seek_view)

            except asyncio.TimeoutError:
                # انتهى الوقت بدون ما يضغط
                await ctx.send(f"⏰ انتهى وقت {current_player.mention}! الدور يحول للي بعده.", delete_after=3)

            # الانتقال للدور التالي
            if len(alive_players) > 1:
                turn_idx = (turn_idx + 1) % len(alive_players)
                # استراحة بسيطة جداً (نصف ثانية) لرؤية الإكس بوضوح قبل انتقال نص الدور للاعب التالي
                await asyncio.sleep(0.5)

        # 4. نهاية اللعبة (إعلان الفائز)
        for child in seek_view.children:
            child.disabled = True
        await seek_msg.edit(view=seek_view)
        await status_msg.delete()

        winner = alive_players[0] # الصامد الأخير
        
        # حساب أكثر واحد صاد
        top_hunter_id = max(game_state['scores'], key=game_state['scores'].get)
        top_score = game_state['scores'][top_hunter_id]
        top_hunter = discord.utils.get(players, id=top_hunter_id)

        await send_hide_win_screen(ctx.channel, winner, top_hunter, top_score, survivor_win=True)

async def setup(bot):
    await bot.add_cog(HideGameCog(bot))