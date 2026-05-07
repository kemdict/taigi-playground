# rime-yataigi

Yet another Taigi schema for RIME.

Old readme below.

---

# RIME schema for Taigi

Because Ithuan shut down its RIME-derived input method for some reason.

Aims to not copy Ithuan too much, but obviously with me trying to make a full replacement things could look similar.

## Todos

- Import words from Kemdict sources
  - This requires a way to go from written POJ/TL to the input form. KeSi doesn't have that, *we'll have to write this ourself*.
  - Specifically: Kautian (just take old version if you don't yet want to adapt to the new version)
  - Others: TaijitToaSutian is also pretty major
  - For Lomaji: take each lomaji entry, each taigi-kip entry is KIPUnicode -> KIPInputForm
    - Naming inspired by ChhoeTaigi.
      - KIPUnicode = the original entry converted to KIP, NFC normalized
      - KIPInputForm = the original entry converted to KIP (input form) with KeSi
    - This alone should be enough even if the raw syllable entries are not ready.
  - Then maybe analyze the word frequency. In theory this is just a massive number of greps in a corpus; in practice (a) is that actually possible performance-wise? and (b) what corpus?
    - "Corpus": zh-min-nan Wikipedia can be alright. Its issue is just that you don't get Han character frequencies. Compared to zh_TW corpus collection (too many things are zh_CN and it's nontrivial to actually find usable pure zh_TW corpuses even though zh_TW is pretty distinct in actual use) this is more than fine.
    - Others: newspaper archives? Talks?

## Goals

- Just two RIME schemas, one for POJ, one for Ministry of Education's revised POJ (which isn't usually called POJ but is really just a 20-y/o spelling reform). I will refer to the latter as KIP (like KeSi does) from now on.

  MoE does get to do a spelling reform because they maintain a widely and freely available dictionary.
  
- Han character usage toggled as a state. This should be possible??

- POJ and KIP switches are definitely beyond my abilities because I don't know the exact correct conversion rules.

## Comparison

Ministry of Education [actually has a Taigi input method](https://language.moe.gov.tw/result.aspx?subclassify_sn=478&content_sn=21) and might be alright. It has a PDF home page, but that's... fine... I guess...

- This IME isn't able to type full POJ with abbreviated POJ, like "kamu" -> "kám-ū", which I rely on because I haven't learned tone sandhi
- The goal of this RIME schema is to also support traditional POJ.
- This schema will hopefully include more words from other sources (thanks to ChhoeTaigi's release); this probably just matches Ithuan.

[FHL Taigi IME](https://taigi.fhl.net/TaigiIME/index1.html) was the standard but right now it doesn't work on Windows 11.

- I don't know how this IME was like.

## References

- I absolutely try to avoid referencing Ithuan due to its license. At the same time, before this input method is functional I would have to type Taigi with Ithuan's schema, unfortunately.
- rime/rime-cantonese
- what I myself have done for kisaragi-hiu/kisaragi-rime-tw (zh_TW bopomofo to my taste)
- rime/rime-prelude
- glll4678/rime-taigi
- https://xishansnow.github.io/posts/41ac964d

https://github.com/LEOYoon-Tsaw/Rime_collections/blob/master/Rime_description.md

## (An attempt at an) editing guideline

- Han character choice in multi-char words: choose whatever MoE chooses. Except: 台 > 臺 due to popular usage.

## etc.

- Put frequency data in essay-taigi.txt
- Where do we find frequency data; how do we get that analysis?
- Does Unihan have Hokkien Han character pronunciation data [like it does with Cantonese](https://github.com/rime/rime-cantonese/wiki/%E6%9C%AC%E6%96%B9%E6%A1%88%E7%A2%BC%E8%A1%A8%E8%A3%BD%E4%BD%9C%E6%B5%81%E7%A8%8B#%E5%AD%97%E9%9F%B3%E6%94%B6%E9%8C%84%E6%B5%81%E7%A8%8B)?
