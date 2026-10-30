import sys
from PIL import Image, ImageDraw, ImageFont
d_=sys.argv[1]; out=sys.argv[2]
F=lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',s)
def ld(n):
    im=Image.open(f'{d_}/{n}.png').convert('RGBA'); bg=Image.new('RGBA',im.size,'white'); bg.alpha_composite(im); return bg.convert('RGB')
cuerpo=[('v000','Frente'),('v045','45°'),('v090','Perfil izq.'),('v135','135°'),('v180','Espalda'),('v225','225°'),('v270','Perfil der.'),('v315','315°')]
cw,ch=280,500; W=4*cw+80
cab=[('cab_0','Frente'),('cab_45','45°'),('cab_90','Perfil'),('cab_180','Nuca')]; hw=280
H=60+2*(ch+40)+60+hw+40+60+360
S=Image.new('RGB',(W,H),'white'); D=ImageDraw.Draw(S)
D.text((40,18),'Avatar del paciente',fill=(30,30,30),font=F(34)); y=70
for i,(n,t) in enumerate(cuerpo):
    r,c=divmod(i,4); x=40+c*cw; yy=y+r*(ch+40)
    S.paste(ld(n).resize((cw,ch)),(x,yy+30)); D.text((x+10,yy),t,fill=(90,90,90),font=F(20))
y+=2*(ch+40)+20; D.text((40,y),'Cabeza',fill=(30,30,30),font=F(28)); y+=40
for j,(n,t) in enumerate(cab):
    x=40+j*cw; S.paste(ld(n).resize((hw,hw)),(x,y+28)); D.text((x+10,y),t,fill=(90,90,90),font=F(20))
y+=hw+60; D.text((40,y),'Desde arriba',fill=(30,30,30),font=F(28)); y+=40
a=ld('arriba'); from PIL import ImageOps; bb=ImageOps.invert(a).getbbox(); a=a.crop((bb[0]-10,bb[1]-10,bb[2]+10,bb[3]+10)); a=a.resize((640,int(a.height*640/a.width))); S.paste(a,((W-a.width)//2,y))
S.save(out); print(S.size)
