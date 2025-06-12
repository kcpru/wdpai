
# 𝕐 Design System – biblioteka Web Components

Lekka, **framework‑agnostyczna** biblioteka UI oparta w 100 % na standardzie Web Components.

* hermetyczny Shadow DOM + własne style (brak konfliktów CSS)
* moduły ES – tree‑shaking i zero zależności w runtime
* rejestracja znaczników przez dekorator `@WC()` z jednym dowolnym prefixem.

> Prefiks ustawiasz w `constants/config.ts`. Domyślnie to `y‑`.



## Motyw & tokeny

Cała kolorystyka i rozmiary są w zmiennych CSS, np.:

```css
:root {
  --primary: 240 100% 50%;
  --border: 220 13% 91%;
  --spacing-xl: 1.25rem;
}

.dark {
  --card: 220 8% 14%;
  --card-foreground: 220 8% 96%;
}
```



## Komponenty

| Znacznik          | Kluczowe atrybuty / propsy             | Opis                                             |
| ----------------- | -------------------------------------- | ------------------------------------------------ |
| `<y-button>`      | `variant="primary                      | outline                                          | ghost"`<br>`disabled`<br>`icon-only` | Obsługa klawiatury, slot na ikonę (`<y-icon slot="icon">`) automatyczna. |
| `<y-card>`        | —                                      | Kontener z promieniem, ramką i paddingiem.       |
| `<y-field>`       | `type="text                            | email                                            | number                               | url                                                                      | tel"`<br>`label`, `placeholder`, `error` | Wbudowana walidacja regex, emituje `input` i `change`. |
| `<y-select>`      | `value`, `variant`                     | Stylowany `<select>`, w pełni dostępny.          |
| `<y-icon>`        | `icon="home                            | search                                           | bell                                 | …" `                                                                     | 24×24 SVG inline.                        |
| `<y-image>`       | `src`, `alt`, `round`                  | Lazy‑loading z zanikaniem, opcjonalnie okrągłe.  |
| `<y-post>`        | `author`, `timestamp`, `body`, `likes` | Karta "tweet" używana w timeline demo.           |
| `<y-create-post>` | —                                      | Tekstarea z licznikiem znaków, emituje `submit`. |



## Struktura kodu

```
shadow-component.ts   # baza (qs, on, html…)
└─ wc.ts              # dekorator @WC
   ├─ button.ts
   ├─ card.ts
   ├─ field.ts
   ├─ select.ts
   ├─ icon.ts
   ├─ image.ts
   ├─ post.ts
   ...
```



## Dostępność (a11y)

* czytelne stany focus (`outline-offset`)
* `aria-label` dla przycisków `icon-only`
* komunikaty błędów w `<y-field>` mają `role="alert"`
* pełna obsługa klawiatury



## Licencja

MIT © 2025 Brak
