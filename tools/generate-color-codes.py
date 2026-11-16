"""Generate the GitHub color reference and exact RGB PNG swatches (Pillow)."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'docs/color-codes.json').read_text())
ASSETS = ROOT / 'docs/assets/color-codes'
ASSETS.mkdir(parents=True, exist_ok=True)
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
BOLD = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
regular = ImageFont.truetype(FONT, 23)
bold = ImageFont.truetype(BOLD, 25)
title_font = ImageFont.truetype(BOLD, 37)
small = ImageFont.truetype(FONT, 21)
colors = [c for g in DATA['groups'] for c in g['colors']]
assert len(colors) == 39 and len({c['code'] for c in colors}) == 39
assert {c['code'][2:] for c in colors} == set('0123456789ABCDEFGHIJKLMNOPQRSTUV;:?@<=>')

def filename(c):
    return f"code-{ord(c['code'][-1]):02x}.png"

def swatch(draw, x, y, color, w=96, h=30):
    # Constant outline makes both pure white and pure black visible on GitHub.
    draw.rectangle((x,y,x+w-1,y+h-1),fill='#64748b')
    draw.rectangle((x+2,y+2,x+w-3,y+h-3),fill=color)

for c in colors:
    im=Image.new('RGB',(96,30),'#64748b')
    swatch(ImageDraw.Draw(im),0,0,c['hex'])
    im.save(ASSETS / filename(c))

W=1900
H=150+len(DATA['groups'])*45+len(colors)*48+72
im=Image.new('RGB',(W,H),'#f8fafc')
draw=ImageDraw.Draw(im)
draw.text((30,18),'D2R 텍스트 색상 코드 · Colors (Current)',font=title_font,fill='#0f172a')
draw.text((30,73),f"악마술사의 군림 이후 · 39개 코드 · 확인: {DATA['checked_on']} · HEX 원문 값 그대로",font=small,fill='#475569')
xs=[30,155,300,575,795,990]
for x,t in zip(xs,['색상 견본','게임 코드','영문 색상명','한글 색상명','HEX','게임 내 기본 사용처']):
    draw.text((x,117),t,font=small,fill='#334155')
y=155
for group in DATA['groups']:
    draw.rectangle((20,y,W-20,y+38),fill='#e2e8f0')
    draw.text((30,y+2),group['name'],font=bold,fill='#0f172a')
    y+=45
    for c in group['colors']:
        draw.line((20,y+46,W-20,y+46),fill='#e2e8f0')
        swatch(draw,xs[0],y+7,c['hex'])
        texts=[c['code'],c['english'],c['korean'],c['hex'],c['usage']]
        for x,t in zip(xs[1:],texts):
            assert draw.textbbox((x,y),t,font=regular)[2] < W-20, t
            draw.text((x,y+3),t,font=regular,fill='#0f172a')
        y+=48
assert y+45 <= H
# A short caption fits in the image; complete evidence and limitations are in Markdown.
draw.text((30,y+12),'[2] 현행 클라이언트 색상 분석 근거. 미확인 용도는 추정하지 않음. 전체 출처: COLOR_CODES.md',font=small,fill='#475569')
im.save(ASSETS / 'color-chart.png')

md='''# Diablo II: Resurrected 텍스트 색상 코드

![악마술사의 군림 이후 현행 텍스트 색상표](docs/assets/color-codes/color-chart.png)

확인 날짜: **2026-11-16 (한국 시간)** · **39개 코드** · 기준: **악마술사의 군림(Reign of the Warlock) 이후 `Colors (Current)`** [1]. 구버전 `Colors (Old, Before RotW Expansion)`의 값은 사용하지 않았습니다.

견본은 원문 HEX를 그대로 RGB 픽셀로 만든 PNG입니다. 게임 화면을 측색한 결과가 아니며, 게임의 HDR·감마·표시 효과에 따른 화면상의 색까지 보장하지 않습니다. **UI 팔레트나 텍스트 색상을 바꾸는 모드를 사용하면 실제 색상은 달라질 수 있습니다.**

## 코드와 기본 사용처

표의 영문 이름은 원문을 유지했습니다. 비슷한 색끼리 묶었으며 그룹 안에서는 밝기·색조가 이어지도록 배치했습니다. 같은 이름·같은 HEX여도 게임 코드가 다르면 별도 행입니다. `White`로 명명된 `ÿc=`와 `Gray`로 명명된 `ÿcK`처럼 육안상 다른 색조가 섞여 보이는 항목도 원문 이름과 값을 임의로 고치지 않았습니다.

**기본 사용처의 ‘툴팁’과 ‘바닥 라벨’은 구분해야 합니다.** 현행 클라이언트 분석 [2]는 일반·매직·세트·레어·유니크·크래프트의 두 표시 위치에 서로 다른 색상 인덱스를 기록합니다. 아래 사용처는 이 분석에 근거하며, 필터가 새로 지정하는 색을 기본 용도로 옮겨 적지 않았습니다. 소켓·무형·룬워드 등 예외는 아래 확인 범위 참고.

'''
for g in DATA['groups']:
    md+=f"### {g['name']}\n\n| 색상 견본 | 게임 코드 | 영문 색상명 | 한글 색상명 | HEX | 게임 내 기본 사용처 |\n|---|---|---|---|---|---|\n"
    for c in g['colors']:
        md+=f"| ![{c['hex']}](docs/assets/color-codes/{filename(c)}) | `{c['code']}` | {c['english']} | {c['korean']} | `{c['hex']}` | {c['usage']} |\n"
    md+='\n'
md+='''## 기본 사용처의 확인 범위

- [2]는 블리자드 공식 명세가 아닌 **현행 클라이언트를 분석한 커뮤니티 소스**입니다. `LabelPlainColors`와 `TooltipPlainColors`는 필터의 사용자 색상 설정이 아니라 원래 게임 색과 비교하기 위한 기준 배열입니다. 아이템 품질과 색상 인덱스 매핑은 원문 주석과 배열을 함께 대조했습니다.
- 바닥 라벨의 일반/매직/세트/레어/유니크/크래프트 인덱스는 각각 **13/18/19/15/20/16**, 툴팁은 **0/3/2/9/4/8**입니다. 원문이 명시한 코드 변환(`코드 마지막 문자 − '0'`)에 따라 표에 반영했습니다.
- **소켓·무형 아이템:** [2]는 일반 품질 색상과 구분되는 회색 예외가 있음을 설명하지만, 해당 분기의 정확한 현행 코드/인덱스는 인용한 자료에서 확인되지 않습니다. 따라서 `ÿc5` 또는 `ÿcK`에 추정 배정하지 않았습니다. 무형 매직·유니크 등 모든 품질이 무조건 회색이라는 뜻도 아닙니다.
- **룬워드:** 이름이 금색이라는 이유만으로 `ÿc4`, `ÿc7`, `ÿcD` 등에 배정하지 않았습니다. 확인한 현행 자료에서 정확한 기본 코드를 특정하지 못했습니다.
- 룬·퀘스트 아이템·기타 UI와 예외적 표시 상태도 정확한 코드가 확인되지 않으면 사용처를 추가하지 않았습니다. ‘확인되지 않음’은 **미사용·작동 불가라는 뜻이 아닙니다.**
- 이 문서 작성 중 실제 게임에서 39개 코드나 모든 기본 사용처를 직접 재시험하지는 않았습니다. 과거 게임의 색상 용도·HEX를 현재 버전 근거로 대체하지 않았습니다.

## 커스텀 필터·문자열 활용 예시

아래는 사용자가 원하는 색을 직접 지정하는 예시이며 **기본 게임의 사용처가 아닙니다.**

```js
const hammerName = 'ÿc8룬 분해 망치'; // 커스텀 이름에 주황 코드 지정
const neutralLine = 'ÿc0추가 재료 없이 단독 조합'; // 다음 줄의 색상도 명시
const colorPrefix = '\\u00ffc';
const customName = `${colorPrefix}P사용자 지정 이름`; // 현행 ÿcP는 Pink
```

`ÿ`는 **U+00FF**입니다. 복사할 때 `y`로 바꾸지 마세요. 문자열에 넣는 코드는 `ÿc` 뒤 한 글자이며, 색상 이름이나 HEX 자체를 게임 코드 자리에 넣는 방식이 아닙니다. `ÿcP` 등은 확장팩 이전 표와 의미가 다르므로 옛 표의 색상 이름으로 해석하지 마세요. 이 문서는 참고 자료만 추가하며 게임 필터·UI 팔레트·기존 모드 설정은 수정하지 않습니다.

## 출처와 재생성

1. **색상 코드·영문 이름·HEX:** [olegbl/d2rmm — D2R Text Color Codes / Colors (Current)](https://github.com/olegbl/d2rmm/blob/master/.claude/d2r-modding-api.md#d2r-text-color-codes). [확인한 고정 버전](PALETTE_SOURCE), 커밋 `826ace147d8ff2303cd7a4b323de25a477d9409c`. 같은 문서의 Old 표는 제외했습니다.
2. **현행 기본 아이템 이름 색상 인덱스:** [CelestialRayOne/d2rloader_plugins — loot-filter/plugin.cpp, 기본 색상 분석 주석](USAGE_SOURCE#L140-L160), [원래 게임 색상 비교 배열](USAGE_SOURCE#L1762-L1780). 확인한 고정 커밋 `acf6e5ad5e248468c86b66876e1cea79ce33d62e`. 필터의 재색칠 기능 자체를 기본 게임 동작이라고 취급하지 않았습니다.

데이터: [docs/color-codes.json](docs/color-codes.json) · 생성 도구: [tools/generate-color-codes.py](tools/generate-color-codes.py). Pillow와 Noto Sans CJK 글꼴을 사용해 `python3 tools/generate-color-codes.py`로 Markdown·전체 PNG·개별 견본 PNG를 함께 재생성합니다. 글꼴 경로는 스크립트 상단에 명시되어 있습니다. 색상 데이터는 수동으로 기본 사용처 근거를 확인한 뒤 갱신해야 합니다.
'''
md=md.replace('PALETTE_SOURCE',DATA['palette_source']).replace('USAGE_SOURCE',DATA['usage_source'])
(ROOT/'COLOR_CODES.md').write_text(md)
print(f'Generated {len(colors)} swatches, one {W}x{H} chart, and COLOR_CODES.md')
