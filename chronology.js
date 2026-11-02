/* Editorial chronological ordering from existing sourced article periods.
 * sort_year is an editorial ordering coordinate, NOT an asserted founding/invention year.
 * Decades/centuries keep their original precision in source_period and UI.
 */
(function(root){
'use strict';
const records = {
  "arts-and-crafts": {
    "sort_year": 1880,
    "basis": "主な展開。前史の1860年代ではありません",
    "source_period": "主な展開 1880頃–1920頃（前史は1860–70年代）",
    "source_article": "entries/arts-and-crafts.html",
    "precision": "approximate-period",
    "catalog_rank": 0
  },
  "art-nouveau": {
    "sort_year": 1890,
    "basis": "主な展開。前ぶれの1880年代ではありません",
    "source_period": "1890年代を中心に広まり、第一次世界大戦頃まで（前ぶれは1880年代）",
    "source_article": "entries/art-nouveau.html",
    "precision": "approximate-period",
    "catalog_rank": 1
  },
  "art-deco": {
    "sort_year": 1920,
    "basis": "主な展開",
    "source_period": "主な展開 1920–30年代（1925年パリ博覧会が重要）",
    "source_article": "entries/art-deco.html",
    "precision": "approximate-period",
    "catalog_rank": 43
  },
  "de-stijl": {
    "sort_year": 1917,
    "basis": "核となった雑誌の創刊",
    "source_period": "1917年創刊の雑誌を核に展開（終期と各作家の活動期は区別）",
    "source_article": "entries/de-stijl.html",
    "precision": "year",
    "catalog_rank": 5
  },
  "russian-constructivism": {
    "sort_year": 1910,
    "basis": "1910年代の形成、1920年代の展開。1910年創始とはしません",
    "source_period": "年代範囲を一次資料で精査中",
    "source_article": "entries/russian-constructivism.html",
    "precision": "approximate-period",
    "catalog_rank": 6,
    "additional_source": "https://www.nationalgalleries.org/art-and-artists/glossary-terms/constructivism",
    "source_institution": "National Galleries of Scotland",
    "sort_label": "1910年代の形成・1920年代の展開",
    "checked_at": "2026-11-02",
    "source_note": "1910年代の形成、1920年代の展開。1910年創始とはしません"
  },
  "swiss-style": {
    "sort_year": 1950,
    "basis": "主な展開",
    "source_period": "主な展開 1950–1970頃（教育・作品の前史と継続は別）",
    "source_article": "entries/swiss-style.html",
    "precision": "approximate-period",
    "catalog_rank": 46
  },
  "postmodernism": {
    "sort_year": 1970,
    "basis": "主な展開",
    "source_period": "主な展開 1970頃–1990頃（分野により差異）",
    "source_article": "entries/postmodernism.html",
    "precision": "approximate-period",
    "catalog_rank": 50
  },
  "bauhaus": {
    "sort_year": 1919,
    "basis": "学校の設立",
    "source_period": "1919–1933",
    "source_article": "entries/bauhaus.html",
    "precision": "year",
    "catalog_rank": 34
  },
  "rinpa": {
    "sort_year": 1600,
    "basis": "17世紀からの主な展開",
    "source_period": "主に17–19世紀／近代以降にも再解釈",
    "source_article": "entries/rinpa.html",
    "precision": "approximate-period",
    "catalog_rank": 54
  },
  "new-typography": {
    "sort_year": 1920,
    "basis": "主な展開",
    "source_period": "主に1920〜30年代。チヒョルトの後年の仕事も、考え方の変化を知るために紹介します。",
    "source_article": "entries/new-typography.html",
    "precision": "approximate-period",
    "catalog_rank": 11
  },
  "international-style": {
    "sort_year": 1920,
    "basis": "欧州での成立時期",
    "source_period": "成立：1920–30年代の欧州／戦後米国の展開も比較（1952年の例）",
    "source_article": "entries/international-style.html",
    "precision": "approximate-period",
    "catalog_rank": 45
  },
  "ukiyoe": {
    "sort_year": 1600,
    "basis": "17世紀からの展開",
    "source_period": "17–19世紀の展開を中心に扱う。1765年は多色の一枚摺・錦絵の重要な節目。",
    "source_article": "entries/ukiyoe.html",
    "precision": "approximate-period",
    "catalog_rank": 55
  },
  "china-new-woodcut": {
    "sort_year": 1930,
    "basis": "形成と展開",
    "source_period": "1930年代の形成と展開を中心に扱う／1940年代以降の変化は別に精査",
    "source_article": "entries/china-new-woodcut.html",
    "precision": "approximate-period",
    "catalog_rank": 18
  },
  "santiniketan": {
    "sort_year": 1901,
    "basis": "学校の設立。1863年のアシュラムとは区別",
    "source_period": "1863年のアシュラム、1901年の学校、1921年の大学をそれぞれの節目として区別。",
    "source_article": "entries/santiniketan.html",
    "precision": "year",
    "catalog_rank": 20
  },
  "mexican-muralism": {
    "sort_year": 1920,
    "basis": "運動の展開・定着",
    "source_period": "1920年代に展開・定着し20世紀後半へ継続。1921年の先行例と1922年の集団的実験を区別する。",
    "source_article": "entries/mexican-muralism.html",
    "precision": "approximate-period",
    "catalog_rank": 21
  },
  "nsukka-school": {
    "sort_year": 1970,
    "basis": "取得資料で確認した教育と制作の展開",
    "source_period": "取得済資料では1970年代の教育と制作の展開を確認。全体の始期・終期は未精査。",
    "source_article": "entries/nsukka-school.html",
    "precision": "approximate-period",
    "catalog_rank": 27
  },
  "hurufiyya": {
    "sort_year": 1950,
    "basis": "20世紀半ばのイラクでの形成。1950は整理上の位置で開始年ではありません",
    "source_period": "20世紀半ばの形成に関する根拠と1968・1986・2010年の作品例。単一集団の創始年や統一した終期は設定しない。",
    "source_article": "entries/hurufiyya.html",
    "precision": "mid-century-editorial-position",
    "catalog_rank": 28,
    "additional_source": "https://qm.org.qa/en/stories/all-stories/collection-highlight-madiha-umar/",
    "source_institution": "Qatar Museums / Mathaf",
    "sort_label": "20世紀半ばのイラクで形成",
    "checked_at": "2026-11-02",
    "source_note": "20世紀半ばのイラクでの形成。1950は整理上の位置で開始年ではありません"
  },
  "flat-design": {
    "sort_year": 2010,
    "basis": "画面表現の普及時期",
    "source_period": "2010年代に普及（NNGは2012年頃を指摘）",
    "source_article": "entries/flat-design.html",
    "precision": "approximate-period",
    "catalog_rank": 73
  },
  "africobra": {
    "sort_year": 1968,
    "basis": "団体の結成年",
    "source_period": "1968年結成／主な検討作例：1968年頃–1980年",
    "source_article": "entries/africobra.html",
    "precision": "year",
    "catalog_rank": 24
  },
  "isotype": {
    "sort_year": 1920,
    "basis": "成立時期",
    "source_period": "1920年代成立／1930–1950年代以降に教育へ展開",
    "source_article": "entries/isotype.html",
    "precision": "approximate-period",
    "catalog_rank": 64
  },
  "first-nations-australia-design": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "現代の実践／本項の検討作例：2019–2021年",
    "source_article": "entries/first-nations-australia-design.html",
    "precision": "unresolved",
    "catalog_rank": 60
  },
  "mingei": {
    "sort_year": 1925,
    "basis": "命名年",
    "source_period": "1925年に命名／1920年代以降",
    "source_article": "entries/mingei.html",
    "precision": "year",
    "catalog_rank": 12
  },
  "vienna-secession": {
    "sort_year": 1897,
    "basis": "団体の結成年",
    "source_period": "1897年結成／ここでは世紀転換期を中心に扱う",
    "source_article": "entries/vienna-secession.html",
    "precision": "year",
    "catalog_rank": 3
  },
  "hfg-ulm": {
    "sort_year": 1953,
    "basis": "学校の設立",
    "source_period": "1953–1968",
    "source_article": "entries/hfg-ulm.html",
    "precision": "year",
    "catalog_rank": 36
  },
  "suprematism": {
    "sort_year": 1915,
    "basis": "公表年",
    "source_period": "1915年に公表／主に1910年代後半–1920年代",
    "source_article": "entries/suprematism.html",
    "precision": "year",
    "catalog_rank": 7
  },
  "sosaku-hanga": {
    "sort_year": 1904,
    "basis": "1904年前後からの展開",
    "source_period": "1904年前後からの展開／主要対象は20世紀前半",
    "source_article": "entries/sosaku-hanga.html",
    "precision": "approximate-period",
    "catalog_rank": 13
  },
  "futurism": {
    "sort_year": 1909,
    "basis": "運動の主な展開",
    "source_period": "1909–1944を中心に／死後鋳造などの受容は区別",
    "source_article": "entries/futurism.html",
    "precision": "year",
    "catalog_rank": 9
  },
  "dada": {
    "sort_year": 1916,
    "basis": "チューリヒでの形成の節目",
    "source_period": "第一次世界大戦期–1920年代を中心に、後年の継続・再制作も参照",
    "source_article": "entries/dada.html",
    "precision": "year",
    "catalog_rank": 8,
    "additional_source": "https://sammlung.staedelmuseum.de/en/person/dada-movement",
    "source_institution": "Städel Museum",
    "sort_label": "1916年、チューリヒで形成",
    "checked_at": "2026-11-02",
    "source_note": "チューリヒでの形成の節目"
  },
  "metabolism": {
    "sort_year": 1960,
    "basis": "宣言年",
    "source_period": "1960年の宣言／主に1960–70年代の展開",
    "source_article": "entries/metabolism.html",
    "precision": "year",
    "catalog_rank": 15
  },
  "wiener-werkstaette": {
    "sort_year": 1903,
    "basis": "工房の設立",
    "source_period": "1903–1932",
    "source_article": "entries/wiener-werkstaette.html",
    "precision": "year",
    "catalog_rank": 4
  },
  "material-design": {
    "sort_year": 2014,
    "basis": "デザインシステムの発表年",
    "source_period": "2014年発表／本稿は初期M1資料を中心に扱う",
    "source_article": "entries/material-design.html",
    "precision": "year",
    "catalog_rank": 74
  },
  "rococo": {
    "sort_year": 1720,
    "basis": "1720年代からの形成",
    "source_period": "フランス1720–30年代に形成／18世紀中葉を中心に展開",
    "source_article": "entries/rococo.html",
    "precision": "approximate-period",
    "catalog_rank": 85
  },
  "neoclassicism": {
    "sort_year": 1750,
    "basis": "1750年代からの展開",
    "source_period": "1750年代〜19世紀初頭を中心に展開",
    "source_article": "entries/neoclassicism.html",
    "precision": "approximate-period",
    "catalog_rank": 86
  },
  "grid-systems": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "特定の発祥年を置かない／参照書籍：1964・1981年",
    "source_article": "entries/grid-systems.html",
    "precision": "unresolved",
    "catalog_rank": 65
  },
  "hideki-nakajima": {
    "sort_year": 1990,
    "basis": "紹介する活動・作品の時期。生年ではありません",
    "source_period": "主な紹介対象：1990年代–2010年代（生没年1961–2022とは区別）",
    "source_article": "entries/hideki-nakajima.html",
    "precision": "approximate-period",
    "catalog_rank": 87
  },
  "punk-diy": {
    "sort_year": 1970,
    "basis": "1970年代半ば以降の展開",
    "source_period": "1970年代半ば以後。本文は英国の1976–77年を中心に扱う",
    "source_article": "entries/punk-diy.html",
    "precision": "approximate-period",
    "catalog_rank": 31
  },
  "new-bauhaus-chicago": {
    "sort_year": 1937,
    "basis": "学校の設立",
    "source_period": "1937–1938年のニュー・バウハウスと、1939年に始まるスクール・オブ・デザインを中心に扱う。比較資料は1946年までの後続教育資料を含む",
    "source_article": "entries/new-bauhaus-chicago.html",
    "precision": "year",
    "catalog_rank": 37
  },
  "vkhutemas": {
    "sort_year": 1920,
    "basis": "学校の設立",
    "source_period": "1920–1930年（後継のヴフテイン期を含む）",
    "source_article": "entries/vkhutemas.html",
    "precision": "year",
    "catalog_rank": 35
  },
  "black-mountain-college": {
    "sort_year": 1933,
    "basis": "学校の設立",
    "source_period": "1933–1957",
    "source_article": "entries/black-mountain-college.html",
    "precision": "year",
    "catalog_rank": 38
  },
  "psychedelic-art": {
    "sort_year": 1960,
    "basis": "主な展開は1960年代後半",
    "source_period": "主に1960年代後半",
    "source_article": "entries/psychedelic-art.html",
    "precision": "approximate-period",
    "catalog_rank": 30
  },
  "streamline-moderne": {
    "sort_year": 1930,
    "basis": "主な展開",
    "source_period": "主に1930年代。個別の製品は1940年代以後も製造",
    "source_article": "entries/streamline-moderne.html",
    "precision": "approximate-period",
    "catalog_rank": 44
  },
  "polish-poster-school": {
    "sort_year": 1950,
    "basis": "主な展開",
    "source_period": "主に1950–70年代",
    "source_article": "entries/polish-poster-school.html",
    "precision": "approximate-period",
    "catalog_rank": 29
  },
  "surrealism": {
    "sort_year": 1924,
    "basis": "運動の重要な宣言",
    "source_period": "1924年の宣言を重要な節目として、1920–30年代を中心に扱う",
    "source_article": "entries/surrealism.html",
    "precision": "year",
    "catalog_rank": 10
  },
  "jugendstil": {
    "sort_year": 1890,
    "basis": "約1890–1910年の展開。雑誌創刊年とは区別",
    "source_period": "19世紀末から20世紀初めを中心に扱う。1896年は雑誌の創刊年で、様式全体の発明年ではない",
    "source_article": "entries/jugendstil.html",
    "precision": "approximate-period",
    "catalog_rank": 2,
    "additional_source": "https://museum-wiesbaden.de/jugendstil-gesamtkunstwerk",
    "source_institution": "Museum Wiesbaden",
    "sort_label": "約1890–1910年",
    "checked_at": "2026-11-02",
    "source_note": "約1890–1910年の展開。雑誌創刊年とは区別"
  },
  "scandinavian-modern": {
    "sort_year": 1930,
    "basis": "本文で紹介する主な時期",
    "source_period": "1930年代–1960年代を中心に紹介。スカンディナヴィアン・デザインという呼称の国際的な宣伝は1950年代に拡大",
    "source_article": "entries/scandinavian-modern.html",
    "precision": "approximate-period",
    "catalog_rank": 47
  },
  "brutalism": {
    "sort_year": 1950,
    "basis": "展開の時期",
    "source_period": "1950年代から展開。紹介例は1950–1982年の建設",
    "source_article": "entries/brutalism.html",
    "precision": "approximate-period",
    "catalog_rank": 49
  },
  "critical-regionalism": {
    "sort_year": 1980,
    "basis": "理論として論じられた時期。比較建築の年代ではありません",
    "source_period": "1980年代に理論として論じられる。比較する建築は1952年・1976年",
    "source_article": "entries/critical-regionalism.html",
    "precision": "approximate-period",
    "catalog_rank": 59
  },
  "mid-century-modern": {
    "sort_year": 1940,
    "basis": "本文で紹介する主な時期。共通の創立年ではありません",
    "source_period": "主に1940年代–1960年代の作品を紹介。共通の創立年・終了年は設けない",
    "source_article": "entries/mid-century-modern.html",
    "precision": "approximate-period",
    "catalog_rank": 48
  },
  "radical-design": {
    "sort_year": 1960,
    "basis": "主な展開は1960年代後半",
    "source_period": "主に1960年代後半–1970年代",
    "source_article": "entries/radical-design.html",
    "precision": "approximate-period",
    "catalog_rank": 32
  },
  "memphis": {
    "sort_year": 1980,
    "basis": "結成期1980–1981年。初発表は1981年",
    "source_period": "1980–1981年の結成と1981年の初発表、1980年代の活動を中心に扱う",
    "source_article": "entries/memphis.html",
    "precision": "approximate-period",
    "catalog_rank": 33
  },
  "new-wave-typography": {
    "sort_year": 1970,
    "basis": "主な展開。前史の1960年代ではありません",
    "source_period": "主に1970–1980年代。背景となる実験は1960年代から",
    "source_article": "entries/new-wave-typography.html",
    "precision": "approximate-period",
    "catalog_rank": 51
  },
  "supergraphics": {
    "sort_year": 1960,
    "basis": "表現の展開",
    "source_period": "1960年代から。本文は1960年代の仕事と2018–2023年の展開を比較",
    "source_article": "entries/supergraphics.html",
    "precision": "approximate-period",
    "catalog_rank": 52
  },
  "bengal-school": {
    "sort_year": 1900,
    "basis": "20世紀初めの主な展開。19世紀末の前史とは区別",
    "source_period": "19世紀末の前史／20世紀初めを中心に展開",
    "source_article": "entries/bengal-school.html",
    "precision": "approximate-period",
    "catalog_rank": 19
  },
  "shinkenchiku-kogei-gakuin": {
    "sort_year": 1933,
    "basis": "学院への改称。前身1932年とは区別",
    "source_period": "前身1932年／学院への改称1933年5月／1930年代半ばまで",
    "source_article": "entries/shinkenchiku-kogei-gakuin.html",
    "precision": "year",
    "catalog_rank": 39
  },
  "kuwasawa-design-school": {
    "sort_year": 1954,
    "basis": "学校の設立",
    "source_period": "1954年設立–",
    "source_article": "entries/kuwasawa-design-school.html",
    "precision": "year",
    "catalog_rank": 40
  },
  "nid-ahmedabad": {
    "sort_year": 1961,
    "basis": "学校の設立",
    "source_period": "1961年設立–／設立前の報告書1958年",
    "source_article": "entries/nid-ahmedabad.html",
    "precision": "year",
    "catalog_rank": 41
  },
  "esdi-rio": {
    "sort_year": 1962,
    "basis": "学校の設立。授業開始1963年とは区別",
    "source_period": "1962年設立／1963年授業開始–",
    "source_article": "entries/esdi-rio.html",
    "precision": "year",
    "catalog_rank": 42
  },
  "shinko-shashin": {
    "sort_year": 1920,
    "basis": "主な展開は1920年代末以降",
    "source_period": "1920年代末–1930年代を中心に",
    "source_article": "entries/shinko-shashin.html",
    "precision": "approximate-period",
    "catalog_rank": 14
  },
  "gutai": {
    "sort_year": 1954,
    "basis": "団体の活動開始",
    "source_period": "1954–1972年",
    "source_article": "entries/gutai.html",
    "precision": "year",
    "catalog_rank": 16
  },
  "mono-ha": {
    "sort_year": 1960,
    "basis": "主な展開は1960年代末",
    "source_period": "1960年代末–1970年代を中心に",
    "source_article": "entries/mono-ha.html",
    "precision": "approximate-period",
    "catalog_rank": 17
  },
  "dansaekhwa": {
    "sort_year": 1970,
    "basis": "主な展開。前史の1960年代ではありません",
    "source_period": "1970年代を中心に／前史は1960年代",
    "source_article": "entries/dansaekhwa.html",
    "precision": "approximate-period",
    "catalog_rank": 56
  },
  "taller-grafica-popular": {
    "sort_year": 1937,
    "basis": "工房の設立",
    "source_period": "1937年設立–",
    "source_article": "entries/taller-grafica-popular.html",
    "precision": "year",
    "catalog_rank": 22
  },
  "tropicalismo": {
    "sort_year": 1960,
    "basis": "主な展開は1960年代後半",
    "source_period": "1960年代後半を中心に",
    "source_article": "entries/tropicalismo.html",
    "precision": "approximate-period",
    "catalog_rank": 23
  },
  "negritude-visual-culture": {
    "sort_year": 1930,
    "basis": "思想・文化運動の時期。美術との関係は1960年代以降",
    "source_period": "1930年代の思想／1960年代以降の美術との関係",
    "source_article": "entries/negritude-visual-culture.html",
    "precision": "approximate-period",
    "catalog_rank": 25
  },
  "khartoum-school": {
    "sort_year": 1960,
    "basis": "本文で扱う主な時期",
    "source_period": "1960年代を中心に／後の展開を含む",
    "source_article": "entries/khartoum-school.html",
    "precision": "approximate-period",
    "catalog_rank": 26
  },
  "wayo-graphic": {
    "sort_year": 1950,
    "basis": "本文が扱う田中一光の活動時期",
    "source_period": "本項は1950年代–1990年代の田中一光を中心に",
    "source_article": "entries/wayo-graphic.html",
    "precision": "approximate-period",
    "catalog_rank": 53
  },
  "brazilian-modernism": {
    "sort_year": 1920,
    "basis": "主な展開",
    "source_period": "1920年代を中心に／その後も多様に展開",
    "source_article": "entries/brazilian-modernism.html",
    "precision": "approximate-period",
    "catalog_rank": 57
  },
  "tropical-modernism": {
    "sort_year": 1940,
    "basis": "主な展開",
    "source_period": "1940年代以降を中心に",
    "source_article": "entries/tropical-modernism.html",
    "precision": "approximate-period",
    "catalog_rank": 58
  },
  "typography-typesetting": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：1454–1455年、1896年、1928年",
    "source_article": "entries/typography-typesetting.html",
    "precision": "unresolved",
    "catalog_rank": 61
  },
  "photomontage": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：1925–1930年",
    "source_article": "entries/photomontage.html",
    "precision": "unresolved",
    "catalog_rank": 62
  },
  "collage": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：1919–1924年",
    "source_article": "entries/collage.html",
    "precision": "unresolved",
    "catalog_rank": 63
  },
  "silkscreen": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：1967–1983年",
    "source_article": "entries/silkscreen.html",
    "precision": "unresolved",
    "catalog_rank": 66
  },
  "risograph": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "技術史の参照：1980年、1984年、2013年。掲載印刷作品の制作年は未確認。",
    "source_article": "entries/risograph.html",
    "precision": "unresolved",
    "catalog_rank": 67
  },
  "pixel-art": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2021–2023年",
    "source_article": "entries/pixel-art.html",
    "precision": "unresolved",
    "catalog_rank": 68
  },
  "generative-design": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2001年以降のシリーズ、2015年の試作",
    "source_article": "entries/generative-design.html",
    "precision": "unresolved",
    "catalog_rank": 69
  },
  "parametric-design": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2010–2012年",
    "source_article": "entries/parametric-design.html",
    "precision": "unresolved",
    "catalog_rank": 70
  },
  "information-visualization": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：継続更新されるオンライン教材（開始年は一括しない）",
    "source_article": "entries/information-visualization.html",
    "precision": "unresolved",
    "catalog_rank": 71
  },
  "skeuomorphism": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2011年のアプリと継続更新の音楽ソフト",
    "source_article": "entries/skeuomorphism.html",
    "precision": "unresolved",
    "catalog_rank": 72
  },
  "neumorphism": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "近年の画面表現。発祥年はここで断定しない",
    "source_article": "entries/neumorphism.html",
    "precision": "unresolved",
    "catalog_rank": 75
  },
  "glassmorphism": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "近年の画面表現。下記の製品ごとに時期を分ける",
    "source_article": "entries/glassmorphism.html",
    "precision": "unresolved",
    "catalog_rank": 76
  },
  "web-brutalism": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "近年のウェブの呼び名。統一した開始年はない",
    "source_article": "entries/web-brutalism.html",
    "precision": "unresolved",
    "catalog_rank": 77
  },
  "neo-brutalism": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "近年の画面表現。歴史運動の開始年は設定しない",
    "source_article": "entries/neo-brutalism.html",
    "precision": "unresolved",
    "catalog_rank": 78
  },
  "bento-layouts": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2023–2024年の制作ほか",
    "source_article": "entries/bento-layouts.html",
    "precision": "unresolved",
    "catalog_rank": 80
  },
  "y2k-revival": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2021年、2026年ほか",
    "source_article": "entries/y2k-revival.html",
    "precision": "unresolved",
    "catalog_rank": 79
  },
  "kinetic-typography": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2022年ほか。技法の開始年ではない",
    "source_article": "entries/kinetic-typography.html",
    "precision": "unresolved",
    "catalog_rank": 81
  },
  "variable-font-expression": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "技術の標準化：OpenType 1.8（2016年）。掲載例の時期は別に示す",
    "source_article": "entries/variable-font-expression.html",
    "precision": "unresolved",
    "catalog_rank": 82
  },
  "3d-clay-illustration": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "近年のデジタル表現。3D全体の起源を示す年代ではない",
    "source_article": "entries/3d-clay-illustration.html",
    "precision": "unresolved",
    "catalog_rank": 83
  },
  "maximalist-web": {
    "sort_year": null,
    "basis": "共通の年代基準を未確定。掲載作例の年を発祥年には使いません。",
    "source_period": "掲載例：2026年の催事、継続公開の制作者サイト",
    "source_article": "entries/maximalist-web.html",
    "precision": "unresolved",
    "catalog_rank": 84
  },
  "ito-jakuchu": {
    "sort_year": 1750,
    "basis": "紹介作品の1750年代後半。生年ではありません",
    "source_period": "主な紹介作品：1750年代後半〜1792年（生没年1716〜1800年とは区別）",
    "source_article": "entries/ito-jakuchu.html",
    "precision": "approximate-period",
    "catalog_rank": 88
  }
};
function key(slug){const r=records[slug];return r&&Number.isFinite(r.sort_year)?r.sort_year:null;}
function compareSlugs(a,b){const x=key(a),y=key(b);if(x===null&&y!==null)return 1;if(x!==null&&y===null)return -1;return (x===null?0:x-y)||((records[a]?.catalog_rank??Infinity)-(records[b]?.catalog_rank??Infinity))||String(a).localeCompare(String(b));}
function sort(rows,slugOf=x=>x.slug){return [...rows].sort((a,b)=>compareSlugs(slugOf(a),slugOf(b)));}
const api={records,key,compareSlugs,sort};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.LineageChronology=api;
})(typeof globalThis!=='undefined'?globalThis:this);
