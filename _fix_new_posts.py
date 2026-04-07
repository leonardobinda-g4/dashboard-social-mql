import json

data = [
["2026-04-05T00:00:00.000Z","17841401790220816","REELS","Feliz P\u00e1scoa a todos \u2764\ufe0f\ud83d\ude4f Deus aben\u00e7oe a todas fam\u00edlias","https://www.instagram.com/reel/DWv_MFpD8ea/","10252","347","18","2","4","373"],
["2026-04-05T00:00:00.000Z","17841451164130731","FEED","E a\u00ed, sabia dessas t\u00e9cnicas do Steve Jobs para fazer a Apple sair do preju\u00edzo?","https://www.instagram.com/p/DWv2-biF2X3/","642","17","1","7","10","35"],
["2026-04-05T00:00:00.000Z","17841443044221566","FEED","Esses foram os carros usados por um dos maiores nomes do automobilismo mundial.\n\nFa\u00e7a parte do clube de neg\u00f3cios para empres\u00e1rios que querem mais acesso, networking e aprendizado.\n\nClique no link da bio e aplique-se para o processo seletivo.","https://www.instagram.com/p/DWwRUGkjnDC/","0","19","0","0","2","21"],
["2026-04-05T00:00:00.000Z","17841401694730077","REELS","Esse \u00e9 o pre\u00e7o de empreender que as pessoas n\u00e3o contam.","https://www.instagram.com/reel/DWwNbeIgMEw/","7036","561","15","0","59","678"],
["2026-04-05T00:00:00.000Z","17841401790220816","FEED","Se voc\u00ea n\u00e3o agir agora, vai chegar no fim do ano exatamente onde est\u00e1 hoje: apenas pensando.\n\nO medo trava, mas a estrat\u00e9gia liberta. Pare de planejar e comece a construir. O link na bio \u00e9 para quem decidiu que hoje \u00e9 o dia 1 da sua virada de chave.","https://www.instagram.com/p/DWwImaPD8Er/","20739","3013","9","364","298","3918"],
["2026-04-05T00:00:00.000Z","17841451164130731","FEED","E a\u00ed, sabia dessas t\u00e9cnicas do Steve Jobs para fazer a Apple sair do preju\u00edzo?","https://www.instagram.com/p/DWv2-biF2X3/","966","32","1","24","15","73"],
["2026-04-05T00:00:00.000Z","17841401790220816","FEED","Feliz P\u00e1scoa para todas as fam\u00edlias.\nQue Deus aben\u00e7oe a todos.","https://www.instagram.com/p/DWwfknGlqIr/","72308","8263","81","63","24","8444"],
["2026-04-05T00:00:00.000Z","17841401790220816","FEED","Se voc\u00ea n\u00e3o agir agora, vai chegar no fim do ano exatamente onde est\u00e1 hoje: apenas pensando.\n\nO medo trava, mas a estrat\u00e9gia liberta. Pare de planejar e comece a construir. O link na bio \u00e9 para quem decidiu que hoje \u00e9 o dia 1 da sua virada de chave.","https://www.instagram.com/p/DWwImaPD8Er/","161575","10345","31","1800","1076","14087"],
["2026-04-05T00:00:00.000Z","17841409389886260","REELS","Entregamos em um m\u00eas mais do que o resultado de 2021 inteiro.","https://www.instagram.com/reel/DWxAYFVD1bP/","3381","71","1","20","3","95"],
["2026-04-06T00:00:00.000Z","17841410743593080","FEED","O onboarding mal feito n\u00e3o custa s\u00f3 tempo.","https://www.instagram.com/p/DWyiqn4FapD/","7592","78","2","23","38","143"],
["2026-04-05T00:00:00.000Z","17841410743593080","FEED","O mercado de luxo est\u00e1 vivendo o pior in\u00edcio da sua hist\u00f3ria.","https://www.instagram.com/p/DWwR3ZolSE6/","34736","424","4","205","131","766"],
["2026-04-06T00:00:00.000Z","17841401694730077","REELS","Comente \"Canal\" que eu te envio agora o Ep. completo \ud83d\udc4a\ud83c\udffe\ud83c\udde7\ud83c\uddf7","https://www.instagram.com/reel/DWyhLrGjqvz/","6499","186","8","1","11","209"],
["2026-04-06T00:00:00.000Z","17841401694730077","FEED","Pare de contratar gente ruim\u2026 use essa estrat\u00e9gia.","https://www.instagram.com/p/DWy2xrZgARV/","0","67","1","0","11","82"],
["2026-04-05T00:00:00.000Z","17841451164130731","FEED","Voc\u00ea pagaria para ter a tecnologia desse rel\u00f3gio?","https://www.instagram.com/p/DWwx95rl8aJ/","2376","53","1","4","13","71"],
["2026-04-06T00:00:00.000Z","17841451164130731","FEED","Voc\u00ea usa algum desses indicadores na sua empresa?","https://www.instagram.com/p/DWysj99lt6i/","436","21","0","9","27","57"],
["2026-04-05T00:00:00.000Z","17841401694730077","REELS","Esse \u00e9 o pre\u00e7o de empreender que as pessoas n\u00e3o contam.","https://www.instagram.com/reel/DWwNbeIgMEw/","40681","3077","31","579","300","4165"],
["2026-04-05T00:00:00.000Z","17841401694730077","FEED","H\u00e1 exatos 1993 anos Cristo venceu a morte.","https://www.instagram.com/p/DWwapYslFIJ/","93988","7471","55","382","307","8353"],
["2026-04-05T00:00:00.000Z","17841401694730077","FEED","O Brasil vai continuar\u00e1 exportando seus melhores c\u00e9rebros.","https://www.instagram.com/p/DWxED1tjmTh/","153731","10780","233","614","451","12387"],
["2026-04-05T00:00:00.000Z","17841410743593080","FEED","O Tiktok est\u00e1 dando um passo ousado: se tornar um banco.","https://www.instagram.com/p/DWw6tNWGCxE/","44235","299","7","116","71","497"],
["2026-04-06T00:00:00.000Z","17841401790220816","FEED","Todo mundo quer crescer, mas a sacada \u00e9 que pouqu\u00edssimos querem assumir a responsabilidade.","https://www.instagram.com/p/DWydZywj7uF/","34666","3088","10","353","300","3941"],
["2026-04-05T00:00:00.000Z","17841443044221566","FEED","Esses foram os carros usados por um dos maiores nomes do automobilismo mundial.","https://www.instagram.com/p/DWwRUGkjnDC/","11306","307","1","15","27","353"],
["2026-04-06T00:00:00.000Z","17841454542318840","REELS","Est\u00e1 no ar mais um epis\u00f3dio de O Jogo da IA.","https://www.instagram.com/reel/DWymzUvErH2/","1061","26","0","3","4","34"],
["2026-04-05T00:00:00.000Z","17841401790220816","REELS","Feliz P\u00e1scoa a todos \u2764\ufe0f\ud83d\ude4f Deus aben\u00e7oe a todas fam\u00edlias","https://www.instagram.com/reel/DWv_MFpD8ea/","15102","405","18","5","5","435"],
["2026-04-05T00:00:00.000Z","17841401790220816","FEED","O segredo do crescimento previs\u00edvel est\u00e1 em identificar e focar no seu ICP.","https://www.instagram.com/p/DWws2F3loUz/","6514","135","3","40","96","276"],
["2026-04-05T00:00:00.000Z","17841401790220816","REELS","Comente \"CANAL\" para receber o link do epis\u00f3dio na DM\ud83d\udd25","https://www.instagram.com/reel/DWws06_hcbF/","17167","991","7","138","76","1222"],
["2026-04-05T00:00:00.000Z","17841401694730077","FEED","Quando voc\u00ea mente pra agradar, voc\u00ea perde um peda\u00e7o de si mesmo.","https://www.instagram.com/p/DWw0nDDFAng/","96525","6728","12","393","443","7879"],
["2026-04-05T00:00:00.000Z","17841450715885183","FEED","No G4 Skills voc\u00ea tem acesso a +100 ferramentas.","https://www.instagram.com/p/DWxeb6QjtU_/","2474","62","0","29","86","178"],
["2026-04-06T00:00:00.000Z","17841409389886260","FEED","Quem centraliza n\u00e3o escala, simples.","https://www.instagram.com/p/DWybaNkgCYI/","4032","179","1","43","98","323"],
["2026-04-06T00:00:00.000Z","17841401790220816","REELS","Vender \u00e9 administrar a informa\u00e7\u00e3o.","https://www.instagram.com/reel/DWy2g4pjxge/","0","4","0","0","1","5"]
]

with open('_genie_new_posts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=True, separators=(',', ':'))
print(f'Saved {len(data)} rows')
