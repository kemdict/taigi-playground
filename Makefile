install:
	ln -sf $$(pwd)/*.yaml ~/.local/share/fcitx5/rime/
	ln -sf $$(pwd)/essay*.txt ~/.local/share/fcitx5/rime/

syllables:
	cd processing && bun writeSyllables.ts

words:
	cd processing && bun writeWords.ts

frequencies:
	bun processing/wordFrequency.ts \
		--dir /run/media/kisaragi-hiu/Data/cloud/datasets/taigi \
		--dir ~/git/tesstrain/data/langdata \
		--out essay-taigi.txt
