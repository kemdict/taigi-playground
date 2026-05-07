install:
	ln -sf $$(pwd)/*.yaml ~/.local/share/fcitx5/rime/
	ln -sf $$(pwd)/essay*.txt ~/.local/share/fcitx5/rime/

syllables:
	cd processing && deno run -A writeSyllables.ts

words:
	cd processing && bun writeWords.ts
