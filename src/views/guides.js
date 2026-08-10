// src/views/guides.js — Guides tab: reference cards ported from the OneDrive pages,
// cross-checked against PROJECT_STATUS §14 (oatmeal bread, 1,729 kcal, real products/prices).
// Static content, framed as guides not rules — every target is Dr Ola's. No name, no age.
// render(sub): sub===null → the index of cards; a guide id → that guide + a "‹ Guides" back link.
(function () {
  var PMUTED = 'color:var(--muted);font-size:13px;margin:0 2px 10px';

  // ---- index ----------------------------------------------------------------
  function card(id, ic, t, s) {
    return '<button type="button" class="guide" data-guide="' + id + '">' +
      '<span class="g-ic">' + ic + '</span>' +
      '<span class="g-m"><span class="g-t">' + t + '</span><span class="g-s">' + s + '</span></span>' +
      '<span class="chev">›</span></button>';
  }
  function indexHtml() {
    return '<section class="view active" id="guides">' +
      '<div class="section-h" style="margin-top:8px">Guides</div>' +
      '<p style="' + PMUTED + '">Dr Ola\'s plan, spelled out. These are guides, not rules — every target is hers.</p>' +
      card('yourday', '🍽️', 'Your day &amp; meals', 'Weekday / weekend timing, in grams') +
      card('swaps', '🔁', 'Meal swaps', 'Halal alternatives, matched to your likes') +
      card('grocery', '🛒', 'Grocery helper', 'What to buy, AED costs (~207/week)') +
      card('training', '🏋️', 'Training plan', 'Home dumbbell on-ramp · Phase 2 (locked)') +
      card('rybelsus', '💊', 'Rybelsus protocol', 'How to take it so the dose counts') +
      card('getready', '✅', 'Week 1: get ready', 'What to buy &amp; set up before Day 1') +
    '</section>';
  }

  // ---- detail shell ---------------------------------------------------------
  function detail(title, inner) {
    return '<section class="view active" id="guides">' +
      '<button type="button" class="backlink" data-guides-home>‹ Guides</button>' +
      '<div class="section-h" style="margin-top:4px">' + title + '</div>' +
      inner + '</section>';
  }

  // ---- guide: your day & meals ----------------------------------------------
  function gYourDay() {
    return detail('Your day &amp; meals',
      '<p style="' + PMUTED + '">Dr Ola\'s plan fitted to your day, with exact grams &amp; macros. Each option hits the same target, so you can swap freely. Day total ≈ 1,729 kcal · ~145 g protein.</p>' +

      '<div class="card meal"><h3>📚 Weekday (college)</h3>' +
        '<ul class="items">' +
          '<li><b>~6:00am</b> — 💊 Rybelsus + ≤120 ml plain water. Nothing else for 30 min.</li>' +
          '<li><b>~7:30am</b> — ☕ Coffee at college (fine, 30+ min after the pill).</li>' +
          '<li><b>~12pm · Lunch</b> — 165 g cooked rice + 185 g grilled chicken + 150 g salad + 1 light IFFCO EVOO spray · ≈610 kcal · P63 C55 F12</li>' +
          '<li><b>~5pm · Shake</b> — 1 scoop Laperva whey + 20 g oats + 48 g peanut butter + ½ banana · ≈541 kcal · P44 C34 F25</li>' +
          '<li><b>~7:30–8pm · Dinner</b> — 3 eggs + 1 pc Modern Bakery oatmeal bread (~60 g) + 60 g low-fat cheese + 15 g almonds · ≈578 kcal · P38 C30 F35</li>' +
        '</ul>' +
        '<div class="macros"><span class="mac kcal">Day ≈ 1,729 kcal</span><span class="mac">P 145</span><span class="mac">C 119</span><span class="mac">F 72</span><span class="mac">Fibre ~17 g</span></div>' +
      '</div>' +

      '<div class="card meal"><h3>🏠 Weekend (lunch at home)</h3>' +
        '<ul class="items">' +
          '<li><b>On waking</b> — 💊 Rybelsus + water, wait 30 min.</li>' +
          '<li><b>If hungry</b> — optional breakfast = have dinner (Meal 2) now; then evening = shake only, so the day still totals ~1,700.</li>' +
          '<li><b>~1pm · Lunch</b> at home — same grams as the weekday.</li>' +
          '<li><b>~5pm · Shake</b> — or move it to the evening if you had breakfast.</li>' +
          '<li><b>Before 9pm · Dinner</b> — or lighter if breakfast was eaten.</li>' +
        '</ul>' +
        '<div class="flag">⚠ Home-lunch trap: if it\'s kabsa or oily family food, take ~250 g kabsa (≈400 kcal · P22 C45 F14) instead of rice+chicken — it\'s both already — and add salad. It\'s oilier, so keep it occasional.</div>' +
      '</div>' +

      '<div class="card"><div class="section-h" style="margin:0 0 8px">Golden rules</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>Pill first, coffee later.</b> Never coffee within 30 min of Rybelsus — it blocks the medicine.</li>' +
          '<li><b>Last meal before 9pm</b> (Dr Ola).</li>' +
          '<li><b>Work chicken has hidden oil</b> — pick tikka/tawook over kabsa, ask for less oil, and on an oily day go lighter on the rice. Don\'t out-calculate the cafeteria — the weekly weight trend is the judge.</li>' +
          '<li><b>Eyeball your grams:</b> 100 g chicken ≈ palm-size; 165 g cooked rice ≈ ¾–1 cup; 15 g almonds ≈ 12 nuts.</li>' +
          '<li><b>Fibre + water</b> for the Rybelsus constipation: oats, kiwi, apple with skin, water through the day. The oatmeal bread has ~4 g fibre (less than the diet bread we\'d specced), so lean on these.</li>' +
        '</ul></div>' +

      '<div class="section-h">Mix it up <span class="r">same target, swap freely</span></div>' +
      '<div class="card meal"><h3>🍽️ Lunch — 1 carb + 1 protein + salad</h3>' +
        '<ul class="items">' +
          '<li>Carb · white rice, 165 g cooked · 215 · C47 P4</li>' +
          '<li>Carb · pasta, 140 g cooked · 220 · C43 P8</li>' +
          '<li>Protein · grilled chicken breast, 100 g · 165 · P31 F3.6</li>' +
          '<li>Protein · shish tawook, 100 g · 170 · P29 F6</li>' +
          '<li>Protein · chicken tikka, 100 g · 175 · P28 F7</li>' +
          '<li>Protein · salmon, 100 g (occasional) · 200 · P22 F12</li>' +
          '<li>Salad · 150 g veg + light oil spray · ~65 · C8</li>' +
        '</ul></div>' +
      '<div class="card meal"><h3>🍳 Dinner (Meal 2) — pick one</h3>' +
        '<ul class="items">' +
          '<li>3 eggs + 1 pc oatmeal bread + 60 g low-fat cheese + 15 g almonds · ≈578 · P38 C30 F35 <em>(the plan)</em></li>' +
          '<li>3 eggs + 1 pc oatmeal bread + 40 g feta + 15 g peanut butter · similar</li>' +
          '<li>3 eggs + 60 g tortilla + 60 g low-fat cheese + cucumber · ≈536 · P34 C37 F26</li>' +
        '</ul></div>' +
      '<div class="card meal"><h3>🥤 Shake — 1 scoop whey + 20 g oats + 48 g peanut butter + fruit</h3>' +
        '<ul class="items">' +
          '<li>…+ ½ banana · 541 · P44 C34 F25</li>' +
          '<li>…+ 1 small apple · 567 · P44 C38 F25</li>' +
          '<li>…+ 1 kiwi · 534 · P44 C32 F25</li>' +
        '</ul></div>' +
      '<div class="flag">⚠ Macros are computed by the app (±10%), not by Dr Ola. This arranges her plan; it doesn\'t change her targets. Run the swaps (whey brand, avocado→almonds/cheese, berries→banana) by her.</div>'
    );
  }

  // ---- guide: meal swaps ----------------------------------------------------
  function swapCard(title, role, items) {
    return '<div class="card meal"><h3>' + title + '</h3>' +
      '<div style="color:var(--accent-strong);font-size:12px;font-weight:700;margin:2px 0 8px">' + role + '</div>' +
      '<ul class="items">' + items + '</ul></div>';
  }
  function gSwaps() {
    return detail('Meal swaps',
      '<p style="' + PMUTED + '">Same plan, less boredom. For each thing in Dr Ola\'s plan, here are alternatives that keep the calories &amp; protein <b>about the same</b> — and skip everything you dislike. Mix and match. Halal.</p>' +

      swapCard('Instead of 100 g chicken breast', 'Protein · aim ~150 kcal, ~25–30 g protein',
        '<li>→ 2 whole eggs (or 1 whole + 3 whites) · ~150 kcal · P16–20</li>' +
        '<li>→ lean lamb, ~85 g · ~170 · P25</li>' +
        '<li>→ low-fat white cheese / feta, ~90 g · ~150 · P16</li>' +
        '<li>→ 1 scoop whey (in water) · ~120 · P25</li>' +
        '<li>→ salmon / canned tuna / shrimp (occasional) · ~150 · P22</li>') +

      swapCard('Instead of 165 g cooked rice', 'Carb · aim ~210 kcal',
        '<li>→ cooked pasta, ~140 g · ~210 · C42</li>' +
        '<li>→ oat / brown bread, ~2 slices · ~200 · C36</li>' +
        '<li>→ 1 large tortilla wrap · ~200 · C33</li>' +
        '<li style="color:var(--muted)">Potato, sweet potato, brown rice &amp; quinoa are left out on purpose — you dislike them.</li>') +

      swapCard('Instead of ½ avocado', 'Healthy fat · aim ~110 kcal · your pick',
        '<li>→ extra almonds, ~18 g (about 15) · ~105 · F9</li>' +
        '<li>→ extra low-fat white cheese / feta · ~110 · P8 F7</li>' +
        '<li>→ 1 tsp peanut butter · ~95 · F8</li>' +
        '<li style="color:var(--muted)">Walnuts left out — you dislike them.</li>') +

      swapCard('Instead of yogurt / labneh', 'Dairy protein',
        '<li>→ YoPro high-protein yogurt · ~100 · P15</li>' +
        '<li>→ low-fat white cheese / feta · ~90 · P8</li>' +
        '<li style="color:var(--muted)">Labneh, cottage cheese, halloumi &amp; milk left out — you dislike them.</li>') +

      swapCard('Building your salad (2 cups)', 'Veg · very low calorie, eat freely',
        '<li>→ cucumber, lettuce &amp; leafy greens, carrot, onion, green chili, squeeze of lime · ~50</li>' +
        '<li style="color:var(--muted)">Tomato, pepper, broccoli, cauliflower, courgette &amp; eggplant left out — your dislike list.</li>') +

      swapCard('Shake tweaks', 'Keep it interesting',
        '<li>→ fruit: ½ banana, or apple / orange / kiwi · ~50</li>' +
        '<li>→ fat: 3 tbsp peanut butter, or swap to almond butter · ~285</li>' +
        '<li>→ protein: any vanilla whey works in place of ISO100 · ~120/scoop</li>' +
        '<li style="color:var(--muted)">Berries left out — ½ banana is the default, already in Dr Ola\'s plan.</li>') +

      swapCard('Fruit snacks you like', 'When you want something sweet',
        '<li>→ apple, orange, banana, or kiwi · ~60–90 kcal each</li>' +
        '<li style="color:var(--muted)">Dates, grapes &amp; melon left out — you dislike them.</li>') +

      '<div class="flag">⚠ These swaps aim to keep Dr Ola\'s calories &amp; protein roughly the same, but any real change to her plan — especially the avocado swap and dropping berries — should be okayed by <b>Dr Ola</b>. This gives you variety inside her plan; it doesn\'t rewrite it.</div>'
    );
  }

  // ---- guide: grocery helper ------------------------------------------------
  function moneyRow(label, amt) {
    return '<div class="rep-line"><span class="k">' + label + '</span><span class="v">' + amt + '</span></div>';
  }
  function gGrocery() {
    return detail('Grocery helper',
      '<p style="' + PMUTED + '">Everything to cover Dr Ola\'s plan for one week — foods you like, real store prices in AED. Food budget ≈ AED 207/week once staples are stocked.</p>' +

      '<div class="banner">💰 <b>≈ AED 207 / week</b> once staples are stocked · first shop ≈ AED 706 (you buy the staples + whey tub once).</div>' +

      '<div class="card"><div class="section-h" style="margin:0 0 8px">Your locked picks</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li>Whey = <b>Laperva Iso Triple Zero</b> (isolate).</li>' +
          '<li>Peanut butter = <b>All-Natural</b> 1 kg.</li>' +
          '<li>Whey at <b>1 scoop/day</b>, protein topped up with a bit more chicken (cheaper per gram than whey, same daily protein).</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">🛒 Staples <span class="r">buy once, last weeks</span></div>' +
        moneyRow('Laperva Iso Triple Zero — 4 lb (~2 months at 1 scoop)', 'AED 421') +
        moneyRow('All-Natural peanut butter — 1 kg', 'AED 47') +
        moneyRow('Quaker whole oats — 500 g', 'AED 8.50') +
        moneyRow('Bayara raw almonds — 500 g', 'AED 30') +
        moneyRow('IFFCO extra-virgin olive oil spray — 1 L', 'AED 30') +
        moneyRow('White rice — 5 kg', 'AED 25') +
        '<div class="rep-line" style="font-weight:800"><span class="k" style="color:var(--text)">Staples (one-time)</span><span class="v">AED 562</span></div>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">🛒 Weekly fresh</div>' +
        moneyRow('Chicken breast — ~1.3 kg (185 g/day)', 'AED 36') +
        moneyRow('Modern Bakery oatmeal bread — ~2 packs (1 pc/day)', 'AED 7') +
        moneyRow('Bananas + apple / orange / kiwi', 'AED 18') +
        moneyRow('Cucumber, greens, carrot, onion', 'AED 20') +
        moneyRow('Eggs — 30 (3/day, ~10 days)', 'AED 23') +
        moneyRow('Low-fat white cheese / feta', 'AED 10') +
        moneyRow('Low-fat yogurt / YoPro', 'AED 20') +
        '<div class="rep-line" style="font-weight:800"><span class="k" style="color:var(--text)">Fresh (this week)</span><span class="v">AED ~134</span></div>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Why 1 scoop + more chicken</div>' +
        '<p style="font-size:13.5px;margin:0">Whey costs ~AED 0.26 per gram of protein; chicken (~0.13) and eggs (~0.12) are about half the price. Dropping the 2nd scoop and adding ~85 g chicken keeps your day at <b>~1,700 kcal / ~145 g protein</b> (Dr Ola\'s numbers) while saving ~AED 42/week and making the whey tub last twice as long. It\'s a value swap, not a change to her plan.</p>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">From your recent shop</div>' +
        '<p style="font-size:13.5px;margin:0 0 6px">On your last Carrefour basket, roughly 45% was non-food (not judged).</p>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>Your protein game is already good</b> — eggs, YoPro, chicken cubes. Keep it.</li>' +
          '<li><b>Snacks were the biggest food slice (~AED 116)</b> — chips, cereal, sweets, noodles. Buying fewer each trip is the single highest-impact change.</li>' +
          '<li><b>Fruit &amp; veg was tiny (~5%).</b> Lean into the ones you like — cucumber, carrot, onion, greens, apple, orange, banana.</li>' +
          '<li><b>Swap the snack, keep the habit:</b> a YoPro + a boiled egg or a small handful of almonds feeds the goal.</li>' +
        '</ul></div>' +

      '<div class="flag">⚠ General food guidance and price estimates only — it never overrides Dr Ola. Anything about how much to eat, or changing plan items, is her call.</div>'
    );
  }

  // ---- guide: training plan (Phase 2 — NOT cleared) -------------------------
  function moveRow(name, start, sets, note) {
    return '<div class="rep-line"><span class="k" style="color:var(--text);font-weight:600">' + name +
      (note ? ' <span style="color:var(--warn);font-weight:600">' + note + '</span>' : '') +
      '</span><span class="v" style="font-weight:600">' + start + ' · ' + sets + '</span></div>';
  }
  function gTraining() {
    return detail('Training plan',
      '<div class="banner" style="background:var(--warn-soft);border-color:var(--warn)">🔒 <b>Phase 2 — NOT yet cleared by Dr Ola.</b> Right now she wants <b>walking only, 30 min/day</b>. Start this only when she clears training AND okays your left shoulder — likely ~Week 2 once you\'ve settled on the meds.</div>' +

      '<p style="' + PMUTED + '">Built for someone who has never trained: learn the moves first, add weight slowly, always leave reps in the tank. Form beats weight, every time.</p>' +

      '<div class="card"><div class="section-h" style="margin:0 0 8px">The on-ramp — 3 blocks over 12 weeks</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>Weeks 1–2 · LEARN</b> — bodyweight / empty hands only. 2 sessions/week, 2 sets, higher reps (10–15). Just groove the movement.</li>' +
          '<li><b>Weeks 3–6 · BUILD</b> — add light dumbbells. 3 sessions/week, 3 sets of 8–12. Small, boring jumps.</li>' +
          '<li><b>Weeks 7–12 · PROGRESS</b> — double progression: add weight when you earn it, add a set or an arm move as you recover well.</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Weekly rhythm</div>' +
        '<p style="font-size:13.5px;margin:0">Two full-body workouts (Day A / Day B) that alternate — Mon A · Wed B · Fri A, walk on the days between, rest at least one full day. In Weeks 1–2 just do 2 days (Mon A / Thu B).</p>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Judge the weight — reps in reserve (RIR)</div>' +
        '<p style="font-size:13.5px;margin:0 0 8px">After a set, ask: how many more good reps could I have done?</p>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b style="color:var(--bad)">0 left (failure)</b> — form breaks. Never do this as a beginner, especially on press/RDL.</li>' +
          '<li><b style="color:var(--good)">2–3 left</b> — your zone. Hard but clean. Stop the set here.</li>' +
          '<li><b style="color:var(--warn)">4+ left</b> — too easy; add weight next session.</li>' +
        '</ul>' +
        '<div class="flag">Golden rule: stop a set the moment form breaks, or if you feel it in a joint instead of the muscle. That\'s not quitting — it\'s how you stay uninjured.</div>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Warm-up <span class="r">every session, 5–8 min — not optional</span></div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li>2 min easy march on the spot</li>' +
          '<li>Arm circles — 10 each way · shoulder pull-aparts with a towel — 15 (gentle)</li>' +
          '<li>Cat–cow — 8 slow · hip circles — 8 each side · 10 slow bodyweight squats</li>' +
          '<li>On Day B (press day): 10 gentle shoulder rolls + slow empty-hand press — wake the shoulder up first</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">Day A — full body <span class="r">start weights are Weeks 3+</span></div>' +
        moveRow('Goblet squat', '6 kg', '3 × 8–12', '') +
        moveRow('DB Romanian deadlift', '2 × 5 kg', '3 × 8–12', '⚠ back') +
        moveRow('Incline push-up', 'bodyweight', '3 × 8–12', '⚠ shoulder') +
        moveRow('One-arm DB row', '8 kg', '3 × 8–12/side', '') +
        moveRow('Dead bug', 'bodyweight', '3 × 8/side', '') +
        moveRow('Calf raise (optional)', 'BW / hold DBs', '2 × 15', '') +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">Day B — full body</div>' +
        moveRow('DB reverse lunge', 'BW → 2 × 4 kg', '3 × 8/leg', '') +
        moveRow('Glute bridge', 'BW → 8 kg', '3 × 12', '') +
        moveRow('Seated DB press (neutral grip)', '2 × 3 kg', '3 × 8–12', '⚠ riskiest') +
        moveRow('Chest-supported DB row', '2 × 6 kg', '3 × 8–12', '') +
        moveRow('Plank', 'bodyweight', '3 × 20–40 s', '') +
        moveRow('Biceps curl + triceps kickback (optional)', '2 × 4 kg', '2 × 10–12', '') +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Form &amp; safety — the moves that matter</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>DB Romanian deadlift (highest back risk):</b> flat back, brace the core, hinge from the hips (push your bum back), stay light. Feel it in the hamstrings/glutes, not the lower back — if you feel your back, stop the set.</li>' +
          '<li><b>Seated DB press (⚠ your left shoulder, riskiest):</b> neutral grip (palms facing each other), light weight, slow, pain-free range only. Start 2 × 3 kg. Any pinch or the old injury waking up — <b>stop immediately.</b></li>' +
          '<li><b>If the shoulder complains, substitute the press:</b> floor press (the floor limits the risky range), or light lateral raises 2 × 2 kg, or skip pressing and do an extra set of rows. Then tell Dr Ola it flared.</li>' +
          '<li><b>Incline push-up:</b> elbows ~45° (not wide), shoulders down, hands on a counter/table. Higher surface = less shoulder strain.</li>' +
          '<li><b>Goblet squat / glute bridge / plank:</b> chest up and core braced; the lift comes from legs/glutes, never from arching the spine.</li>' +
          '<li><b>Rows, curl, kickback:</b> no twisting or swinging — controlled reps, upper arm still.</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Progress — reps before weight</div>' +
        '<p style="font-size:13.5px;margin:0">Keep the same weight until all 3 sets hit the top rep (12) with 2–3 RIR. Then add the smallest step (<b>+2 kg</b>), drop back to ~8 reps, and climb again. Push-ups progress by lowering the surface instead: counter → table → chair → floor.</p>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Why this fights the sagging (ترهلات)</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>Keeps your muscle</b> — lifting + your ~145 g protein/day. Muscle keeps you firm as fat leaves.</li>' +
          '<li><b>Moderate fat pace (~0.5–1 kg/week)</b> — steady loss = better skin adaptation. That\'s Dr Ola\'s dial.</li>' +
          '<li><b>Time + hydration</b> — skin tightening lags months behind fat loss; water also helps the Rybelsus constipation.</li>' +
          '<li>Each monthly Seca scan tracks your muscle. If too much lost weight is muscle, the report flags it for Dr Ola — about protein &amp; training, never "eat less".</li>' +
        '</ul></div>' +

      '<div class="flag">⚠ A beginner program from your coach\'s material + standard strength guidance — <b>not medical clearance</b>. Start only when Dr Ola okays training, confirm about your shoulder, warm up every time, and stop any move that causes sharp or joint pain. When in doubt, go lighter.</div>'
    );
  }

  // ---- guide: rybelsus protocol ---------------------------------------------
  function gRybelsus() {
    return detail('Rybelsus protocol',
      '<p style="' + PMUTED + '">How to take the medicine so the dose actually counts. This is the single most important thing you log each day.</p>' +

      '<div class="card"><div class="section-h" style="margin:0 0 8px">The medicine</div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>Rybelsus</b> (oral semaglutide) <b>3 mg</b>.</li>' +
          '<li><b>~1 month at 3 mg</b>, then Dr Ola decides: hold at 3 mg or move to 7 mg. Day 1 = Mon 10 Aug; review ≈ 8 Sep.</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">How to take it <span class="r">a dose only counts if ALL are followed</span></div>' +
        '<ul class="items" style="font-size:13.5px">' +
          '<li><b>On waking</b>, first thing, on an <b>empty stomach</b>.</li>' +
          '<li>Swallow with <b>≤120 ml plain water only</b>.</li>' +
          '<li>Then <b>nothing by mouth for 30 minutes</b> — no food, no coffee, no other drink, no other pills.</li>' +
          '<li>After 30 min, eat/drink normally (coffee at college is fine).</li>' +
        '</ul></div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">Why "taken correctly" matters</div>' +
        '<p style="font-size:13.5px;margin:0">This pill only absorbs well if those steps are followed. That\'s why the daily log records whether each dose was <b>correct</b> — if it wasn\'t, a weak result at Day 30 doesn\'t mean the dose failed. Dr Ola needs that distinction to decide 3 mg vs 7 mg.</p>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 8px">What to expect early</div>' +
        '<p style="font-size:13.5px;margin:0">Appetite drop, and possibly some constipation or nausea in the first days. Eat to comfortable fullness — don\'t force food; if you can\'t finish a meal, tell Dr Ola. Lean on fibre (oats, kiwi, apple with skin) and water.</p>' +
      '</div>' +

      '<div class="flag">⚠ The dose is strict as prescribed — this is the one part of the plan that is never "flexible". If your printed prescription says anything different, the prescription wins.</div>'
    );
  }

  // ---- guide: week 1 get ready ----------------------------------------------
  function checkRow(label, price) {
    return '<div class="rep-line"><span class="k" style="color:var(--text)">☐ ' + label + '</span>' +
      (price ? '<span class="v" style="font-weight:600">' + price + '</span>' : '') + '</div>';
  }
  function gGetReady() {
    return detail('Week 1: get ready',
      '<p style="' + PMUTED + '">Everything to buy and set up so you start clean on <b>Day 1 (Mon 10 Aug)</b> — food, gear, weight, movement. Prices are Carrefour estimates (AED).</p>' +

      '<div class="banner">🛒 <b>First shop ≈ AED 706</b>, then ~AED 207/week. The first trip is bigger because you stock staples that last weeks — mainly the Laperva whey tub (AED 421, ~2 months at 1 scoop/day).</div>' +

      '<div class="card"><div class="section-h" style="margin:0 0 6px">1 · Food — staples (buy once)</div>' +
        checkRow('Laperva Iso Triple Zero whey — 4 lb', 'AED 421') +
        checkRow('All-Natural peanut butter — 1 kg', 'AED 47') +
        checkRow('Quaker whole oats — 500 g', 'AED 8.50') +
        checkRow('Raw almonds (unsalted) — 500 g', 'AED 30') +
        checkRow('Olive oil (EVOO spray) — 1 L', 'AED 30') +
        checkRow('White rice — 5 kg', 'AED 25') +
        '<div class="flag">💡 Tight this week? Buy 3 staples now, 3 next week — spreads the cost.</div>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">2 · Food — weekly fresh</div>' +
        checkRow('Chicken breast — ~1.3 kg (185 g/day)', 'AED 36') +
        checkRow('Modern Bakery oatmeal bread — ~2 packs', 'AED 7') +
        checkRow('Bananas + apple / orange / kiwi', 'AED 18') +
        checkRow('Cucumber, greens, carrot, onion', 'AED 20') +
        checkRow('Eggs — 30 (maybe have)', 'AED 23') +
        checkRow('Low-fat cheese / feta (maybe have)', 'AED 10') +
        checkRow('Low-fat yogurt / YoPro (maybe have)', 'AED 20') +
        '<p style="' + PMUTED + ';margin-top:8px">Check your fridge first — you bought eggs, feta &amp; YoPro on 6 Aug.</p>' +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">3 · Gear</div>' +
        checkRow('Tape measure — for weekly waist (a top progress sign)', 'AED ~10') +
        checkRow('Small water glass/bottle — know your ≤120 ml for the pill (optional)', 'AED ~15') +
        checkRow('7-day pill organiser — never double/skip (optional)', 'AED ~15') +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">4 · Weight &amp; movement</div>' +
        checkRow('Eufy scale (have it) — weigh every morning, after toilet, before food', '') +
        checkRow('WHOOP band (if you find it) — steps, sleep, recovery (nice-to-have)', '') +
        checkRow('Comfortable walking shoes — Week 1 is walking only, 30 min/day', '') +
        checkRow('Adjustable dumbbells (2.5–24 kg/hand) — Phase 2, once Dr Ola clears training', 'AED 300–600 later') +
      '</div>' +

      '<div class="card" style="margin-top:10px"><div class="section-h" style="margin:0 0 6px">✅ Day-1 ready check</div>' +
        checkRow('Rybelsus 3 mg on the nightstand + water ready for morning', '') +
        checkRow('Fridge stocked for lunch, shake &amp; dinner', '') +
        checkRow('Eufy scale ready by the bathroom', '') +
        checkRow('Know tomorrow\'s plan: pill → 30 min → weigh → coffee at college → log tonight', '') +
      '</div>' +

      '<div class="flag">⚠ Prices are estimates. The whey swap + diet items should be okayed by Dr Ola. Don\'t start dumbbells until she clears training (your shoulder).</div>'
    );
  }

  // ---- dispatch -------------------------------------------------------------
  var GUIDES = {
    yourday: gYourDay,
    swaps: gSwaps,
    grocery: gGrocery,
    training: gTraining,
    rybelsus: gRybelsus,
    getready: gGetReady
  };

  function render(sub) {
    if (sub && GUIDES[sub]) return GUIDES[sub]();
    return indexHtml();
  }

  (self.HJ = self.HJ || {}).guides = { render: render };
})();
