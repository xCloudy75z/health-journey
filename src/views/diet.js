// src/views/diet.js — Diet view: Dr Ola's plan decoded into exact grams + macros.
// Static content (PROJECT_STATUS §14 authoritative numbers). Pure — no store, no clock.
(function () {
  function render() {
    return '<section class="view active" id="diet">' +
      '<div class="section-h" style="margin-top:8px">Your diet, decoded <span class="r">Dr Ola-reviewed</span></div>' +
      '<p style="color:var(--muted);font-size:13px;margin:0 2px 6px">Her plan, with the numbers worked out. Targets are hers — this just adds them up.</p>' +

      '<div class="card meal">' +
        '<h3>Lunch <span style="color:var(--muted);font-size:13px;font-weight:500">· ~12pm</span></h3>' +
        '<ul class="items"><li>165 g cooked rice</li><li>185 g grilled chicken</li><li>150 g salad</li><li>1 light spray IFFCO EVOO</li></ul>' +
        '<div class="macros"><span class="mac kcal">≈ 610 kcal</span><span class="mac">P 63</span><span class="mac">C 55</span><span class="mac">F 12</span></div>' +
      '</div>' +

      '<div class="card meal">' +
        '<h3>Shake <span style="color:var(--muted);font-size:13px;font-weight:500">· ~5pm</span></h3>' +
        '<ul class="items"><li>1 scoop Laperva whey</li><li>20 g Quaker oats</li><li>48 g peanut butter</li><li>½ banana</li></ul>' +
        '<div class="macros"><span class="mac kcal">≈ 541 kcal</span><span class="mac">P 44</span><span class="mac">C 34</span><span class="mac">F 25</span></div>' +
      '</div>' +

      '<div class="card meal">' +
        '<h3>Dinner <span style="color:var(--muted);font-size:13px;font-weight:500">· before 9pm</span></h3>' +
        '<ul class="items"><li>3 eggs</li><li>1 pc Modern Bakery oatmeal bread (~60 g)</li><li>60 g low-fat feta</li><li>15 g almonds</li></ul>' +
        '<div class="macros"><span class="mac kcal">≈ 578 kcal</span><span class="mac">P 38</span><span class="mac">C 30</span><span class="mac">F 35</span></div>' +
      '</div>' +

      '<div class="card meal total" style="margin-top:12px">' +
        '<h3>Day total</h3>' +
        '<div class="macros"><span class="mac kcal">≈ 1,729 kcal</span><span class="mac">Protein 145</span><span class="mac">Carbs 119</span><span class="mac">Fat 72</span><span class="mac">Fibre ~17 g</span></div>' +
        '<p style="margin:10px 0 0;font-size:13.5px">Dr Ola\'s target: <b>~1,700 kcal</b>. Protein is the priority macro — never cut it to offset extra oil; adjust rice (carb) or fats.</p>' +
      '</div>' +

      '<div class="card meal" style="margin-top:12px">' +
        '<h3>Standing notes</h3>' +
        '<ul class="items">' +
          '<li>The oatmeal bread has less fibre (4 g) than the diet bread we\'d specced (~8 g) — lean on oats / kiwi / apple / water for the Rybelsus constipation.</li>' +
          '<li>IFFCO EVOO <b>spray</b> = precise oil control (~10–18 kcal per light spray vs ~40 for a poured tsp).</li>' +
          '<li>Work chicken is marinated / grilled (oilier than plain) — pick tikka / tawook over kabsa, ask for less oil; on an oily day go lighter on rice.</li>' +
        '</ul>' +
        '<div class="flag">⚠ These numbers are computed by the app (±10%), not by Dr Ola. Every target is hers. The 7-day weight average is the judge.</div>' +
      '</div>' +
    '</section>';
  }

  (self.HJ = self.HJ || {}).diet = { render: render };
})();
