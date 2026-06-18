# Kemdict Taigi playground

This started as an attempt to make another RIME schema for Taigi. The schema isn't done (yet), but several things made along the way are.

## Taigi word frequencies

Rudimentary (kind of usable) word frequencies can be found in `essay-taigi.txt`.

## rime-yataigi

Hopefully becomes yet another Taigi schema for RIME.

Because Ithuan shut down its RIME-derived input method for some reason. Aims to not copy Ithuan too much, but obviously with me trying to make a full replacement things could look similar.

- POJ/TL conversion done first with [i3thuan5/KeSi](https://github.com/i3thuan5/KeSi) then with [@kemdict/kesi](https://github.com/kemdict/kesi.ts)
- Valid syllable list in `processing/lib/all-syllables.yml`, written to a RIME dict by `processing/writeSyllables.ts`
- Word list + cleanup in `processing/writeWords.ts`. Words are taken from Kemdict sources (directly read from a locally built Kemdict database)
- Rudimentary word frequency analysis in `processing/wordFrequency.ts`. This requires collecting your own corpus.

### Comparison with other input methods

(rime-yataigi is not done or usable yet. You will be better off using the MOE's input method or finding another RIME schema for now.)

Ministry of Education [actually has a Taigi input method](https://language.moe.gov.tw/result.aspx?subclassify_sn=478&content_sn=21) and might be alright. It has a PDF home page, but that's... fine... I guess...

- This IME isn't able to type full POJ with abbreviated POJ, like "kamu" -> "kám-ū", which I rely on because I haven't learned tone sandhi
- The goal of this RIME schema is to also support traditional POJ.
- This schema will hopefully include more words from other sources (thanks to ChhoeTaigi's release); this probably just matches Ithuan.

[FHL Taigi IME](https://taigi.fhl.net/TaigiIME/index1.html) was the standard but right now it doesn't work on Windows 11.

- I've never used it

### References

- I absolutely try to avoid referencing Ithuan due to its license. At the same time, before this input method is functional I would have to type Taigi with Ithuan's schema, unfortunately.
- rime/rime-cantonese
- what I myself have done for kisaragi-hiu/kisaragi-rime-tw (zh_TW bopomofo to my taste)
- rime/rime-prelude
- glll4678/rime-taigi
- https://xishansnow.github.io/posts/41ac964d

https://github.com/LEOYoon-Tsaw/Rime_collections/blob/master/Rime_description.md

## AI use

I have not used AI tools when working on this repository.
