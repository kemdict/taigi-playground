# RIME schema for Taigi

Because Ithuan shut down its RIME-derived input method for some reason.

Aims to not copy Ithuan too much, but obviously with me trying to make a full replacement things could look similar.

## Goals

- Just two RIME schemas, one for POJ, one for Ministry of Education's revised POJ (which isn't usually called POJ but is really just a 20-y/o spelling reform). I will refer to the latter as KIP (like KeSi does) from now on.

  MoE does get to do a spelling reform because they maintain a widely and freely available dictionary.
  
- Han character usage toggled as a state. This should be possible??

- POJ and KIP switches are definitely beyond my abilities because I don't know the exact correct conversion rules.

## References

- I absolutely try to avoid referencing Ithuan due to its license. At the same time, before this input method is functional I would have to type Taigi with Ithuan's schema, unfortunately.
- rime/rime-cantonese
- what I myself have done for kisaragi-hiu/kisaragi-rime-tw (zh_TW bopomofo to my taste)
- rime/rime-prelude

## (An attempt at an) editing guideline

- Han character choice in multi-char words: choose whatever MoE chooses. Except: 台 > 臺 due to popular usage.

## etc.

- Where do we find frequency data; how do we get that analysis?
- Does Unihan have Hokkien Han character pronunciation data [like it does with Cantonese](https://github.com/rime/rime-cantonese/wiki/%E6%9C%AC%E6%96%B9%E6%A1%88%E7%A2%BC%E8%A1%A8%E8%A3%BD%E4%BD%9C%E6%B5%81%E7%A8%8B#%E5%AD%97%E9%9F%B3%E6%94%B6%E9%8C%84%E6%B5%81%E7%A8%8B)?
