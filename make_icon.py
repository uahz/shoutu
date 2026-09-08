# -*- coding: utf-8 -*-
"""生成《守土》印章风图标 icon.ico"""
from PIL import Image, ImageDraw, ImageFont

S = 256
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 朱砂印底
d.rounded_rectangle([6, 6, S - 6, S - 6], radius=52, fill=(200, 69, 44, 255))
d.rounded_rectangle([6, 6, S - 6, S - 6], radius=52, outline=(150, 48, 29, 255), width=5)
# 描金内框
d.rounded_rectangle([34, 34, S - 34, S - 34], radius=30, outline=(246, 238, 220, 255), width=6)

# 印文「守」
font = None
for p in (r"C:\Windows\Fonts\simhei.ttf", r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\simsun.ttc"):
    try:
        font = ImageFont.truetype(p, 148)
        break
    except OSError:
        continue
if font is None:
    font = ImageFont.load_default()
d.text((S / 2, S / 2 - 4), "守", font=font, fill=(246, 238, 220, 255), anchor="mm")

img.save("icon.ico", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
img.save("icon.png")
print("icon.ico / icon.png generated")
