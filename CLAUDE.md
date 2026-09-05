# isabella.cattaneo.uy

Blog personal/familiar sobre Isabella (hija de Bruno Cattáneo, nacida el 27/08/2026 a las 23:42). Es una especie de "mini noticias" estilo Twitter: posts cortos en Markdown, con texto y opcionalmente una foto, ordenados cronológicamente en una única página principal. Sitio estático Jekyll, en español únicamente (sin la estructura bilingüe de otros proyectos del autor), desplegado en GitHub Pages con dominio propio desde el día uno.

Repo: `bcattaneo/isabella.cattaneo.uy` (ya existe en GitHub, remote `origin` configurado). Se despliega vía el build nativo de Jekyll de GitHub Pages — **no hay GitHub Actions workflow**. Esto implica: nada de plugins custom, ni gemas de tema, ni nada que no esté en la [lista de gemas soportadas por GitHub Pages](https://pages.github.com/versions/) (`github-pages` gem). Todos los plugins usados acá (`jekyll-paginate`, `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`) están en esa lista.

## Cómo levantarlo local

```bash
bundle install
bundle exec jekyll serve
```

Sirve en `http://localhost:4000/`. El `Gemfile` fija `jekyll` puro (no la gema pesada `github-pages`) para que `bundle install` sea rápido — el build de producción en GitHub Pages **ignora el Gemfile del repo por completo** y siempre corre con su propio entorno fijo de Jekyll + plugins, así que esto es solo comodidad de desarrollo local, no afecta producción.

Los plugins (`jekyll-paginate`, `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`) están declarados dos veces por diseño, y **hay que mantenerlos sincronizados** si se agrega/saca alguno:
- En `Gemfile`, dentro de `group :jekyll_plugins do ... end` — para que `bundle install` los instale localmente (con jekyll puro no vienen incluidos por defecto).
- En `_config.yml`, bajo `plugins:` — para que Jekyll los active al buildear (tanto local como en GitHub Pages).

## Estructura

```
_config.yml                  → config del sitio, paginación, plugins, defaults (layout de posts)
Gemfile                      → gemas para dev local (ver arriba)
CNAME                        → dominio propio (isabella.cattaneo.uy)
index.html                    → página principal: feed paginado + infinite scroll
                                (ver nota sobre el nombre del archivo más abajo)
_posts/YYYY-MM-DD-slug.md    → cada "noticia" (ver "Cómo escribir un post")
_layouts/default.html        → layout base (head, header, footer)
_layouts/post.html           → layout de un post individual (permalink propio)
_includes/header.html, footer.html
_includes/post-card.html     → partial que renderiza UN post — se usa en el feed
                                de index.html/páginas de paginación Y en el permalink
                                individual (_layouts/post.html), así el markup de
                                un post es idéntico en todos lados
_includes/relurl.html        → ver "Links internos" abajo
assets/css/style.css         → todo el CSS del sitio (sin build step, un solo archivo)
assets/js/feed.js            → infinite scroll (ver "Feed, paginación y lazyloading")
assets/img/isabella-header.jpg → foto de Isabella en el header del sitio (ver
                                "Header y tema" abajo) — distinta de assets/img/posts/,
                                que es para fotos de posts individuales
```

## Links internos: `relurl.html`, no `relative_url` ni rutas absolutas

Igual que en otros sitios del autor (cattaneo.uy): no usar el filtro `relative_url` de Jekyll ni rutas hardcodeadas tipo `/assets/...`. Todo link/src interno pasa por:

```liquid
{% include relurl.html to="/assets/css/style.css" %}
```

Esto calcula una ruta relativa a la profundidad de directorio de la página actual (`page.url`), así que funciona igual si el sitio se sirve en la raíz del dominio o bajo un subpath — sin depender de `baseurl`. Ahora mismo `baseurl` está vacío porque el dominio propio (`isabella.cattaneo.uy`, vía `CNAME`) sirve desde la raíz desde el principio, pero usar `relurl.html` en vez de rutas absolutas evita tener que tocar ningún link si eso cambiara.

Soporta tanto permalinks "pretty" (`page.url` termina en `/`, respaldado por un `index.html` real) como permalinks de archivo plano (`page.url` termina en un nombre de archivo) — en el segundo caso el último segmento es el archivo mismo y no cuenta para la profundidad de `../`.

## Cómo escribir un post

Un archivo nuevo en `_posts/`, nombrado `YYYY-MM-DD-algo-descriptivo.md` (la fecha en el nombre de archivo es la que Jekyll usa para ordenar/generar el permalink, pero la hora real del post va en el front matter, ver abajo). Front matter mínimo:

```yaml
---
date: 2026-08-27 23:42
---

Texto del post en Markdown. Corto, estilo tweet — no lleva título.
```

Con fotos (una o varias — ver "Galería de fotos y carrusel" más abajo):

```yaml
---
date: 2026-08-27 23:42
images:
  - /assets/img/posts/2026-08-27-bienvenida-1.jpg
  - /assets/img/posts/2026-08-27-bienvenida-2.jpg
image: /assets/img/posts/2026-08-27-bienvenida-1.jpg
---

Texto del post.
```

- **No usar `title:`** — los posts son estilo tweet, sin título. Esto está reforzado en `_config.yml` (`defaults:` fuerza `title: ""` para todo lo de `_posts/`) y en `_layouts/default.html` (el `<title>` del navegador y el `og:title`/`twitter:title` de `jekyll-seo-tag` caen al `site.title` cuando el título está vacío) — ver el gotcha del `title` auto-generado más abajo.
- **`date:`** con hora incluida (`YYYY-MM-DD HH:MM`) — se muestra formateada en cada card ("27 de agosto de 2026, 23:42"). Si se omite la hora, Jekyll asume medianoche.
- **`images:`** (opcional, lista) — una o más rutas absolutas a fotos (convención: guardarlas bajo `assets/img/posts/`). Se muestran como thumbnails chicos en la card, **debajo del texto** del post; al hacer clic en cualquiera se abre un lightbox/carrusel con todas las fotos de ese post. Ver "Galería de fotos y carrusel" más abajo.
- **`image:`** (opcional, string único) — **no se renderiza en la card**, es solo para SEO: `jekyll-seo-tag` la usa como `og:image`/`twitter:image`, o sea la foto que se ve en el preview al compartir el link (WhatsApp, etc.). El plugin no soporta una lista de imágenes, por eso es un campo separado de `images:` — normalmente se le pone la misma ruta que `images[0]`. Si un post tiene `images:` pero no `image:`, simplemente no habrá foto en el preview al compartir (no rompe nada, solo no hay og:image).
- Cada post tiene además su propio permalink individual (vía `_layouts/post.html`, permalink por defecto de Jekyll: `/YYYY/MM/DD/slug.html`) — compartible por separado, no solo visible en el feed general.

**Gotcha real, ya pisado una vez**: para que ese permalink individual use `_layouts/post.html` (y por lo tanto herede `_layouts/default.html` con header/footer/CSS/lightbox), hace falta el bloque `defaults:` en `_config.yml` (`scope: {type: posts} → values: {layout: post, ...}`) — Jekyll **no** asigna `layout: post` automáticamente a los archivos de `_posts/` solo por convención de carpeta. Sin ese `defaults:`, cada permalink individual renderiza el contenido del post pelado (sin ningún layout, ningún CSS, ningún include) aunque el feed general se vea perfecto — fácil de no notar si nunca se visita un permalink directamente.

El mismo bloque `defaults:` también fuerza `title: ""` para todo lo de `_posts/` — esto es lo que evita el próximo gotcha: Jekyll auto-genera un `page.title` a partir del nombre de archivo (`Utils.titleize_slug`) para todo post que no tenga `title:` explícito en el front matter, usando `data["title"] ||= ...` (ver `Document#populate_title` en la gema `jekyll`). Como acá los posts nunca llevan `title:` a propósito, sin el default explícito `title: ""` cada permalink terminaría mostrando un título tipo "Bienvenida Isabella" en la pestaña del navegador y en `og:title`/`twitter:title` — justo lo que este sitio busca evitar (posts estilo tweet, sin título, ver arriba). El default de `title: ""` bloquea esa auto-generación (`"" ||= x` en Ruby no reemplaza `""` porque solo `nil`/`false` son falsy) sin romper nada más: `jekyll-seo-tag` trata un `title` vacío como ausente y cae a `site.title`.

Un detalle relacionado si se toca `_layouts/default.html`: el filtro/keyword `blank` de Liquid (`{% if page.title != blank %}`) **no funciona** en este entorno — depende de que el objeto responda a `.blank?`, un método de ActiveSupport/Rails que no está cargado acá (Liquid puro), así que la comparación silenciosamente siempre da `nil`/falso y el `if` termina comportándose como si la condición fuera siempre verdadera. Por eso el `<title>` del layout usa la comparación explícita `{% if page.title and page.title != "" %}` en vez de `blank` — cubre tanto el caso `nil` (páginas que no son posts, como el feed paginado) como el caso `""` (posts, por el default de arriba).

## Galería de fotos y carrusel (lightbox)

Un post puede llevar una o más fotos vía `images:` (ver "Cómo escribir un post" arriba). `_includes/post-card.html` las renderiza **después del texto del post** (`.post-content`), como una fila de thumbnails chicos (`.post-gallery` > `.post-thumb`, botones de 84×84px) — no a ancho completo. Cada `.post-gallery` lleva un atributo `data-images` con un array JSON de las URLs ya resueltas por `relurl.html` (así el JS no tiene que recalcular profundidad de ruta); cada `.post-thumb` lleva `data-index` con su posición en ese array.

`assets/js/lightbox.js` implementa el carrusel/lightbox, 100% vanilla (sin librerías, mismo criterio que `feed.js`/`age.js`). El markup del lightbox (`#lightbox`, con botones prev/next/close, la imagen grande y el contador) es un **singleton**: vive una sola vez en `_layouts/default.html` (al final del `<body>`, después del footer), no dentro de cada card — así aparece en toda página que use el layout base (feed, páginas de paginación, permalinks individuales).

**Gotcha a tener en cuenta si se toca este JS**: los listeners de click/teclado están delegados en `document` (`document.addEventListener("click", ...)`), no atados directamente a cada `.post-thumb` al cargar la página. Esto es necesario porque `feed.js` agrega cards nuevas al DOM dinámicamente (infinite scroll) después de que `lightbox.js` ya corrió — si los listeners estuvieran atados por elemento en el load inicial, las fotos de posts cargados vía infinite scroll no abrirían el lightbox.

Si un post tiene una sola foto en `images:`, el lightbox igual se abre (como una "galería" de un solo elemento) pero oculta las flechas prev/next y el contador.

## Feed, paginación y "lazyloading"

Dos mecanismos distintos, cada uno resolviendo una parte de "mostrar todos los posts con lazyloading y paginado al llegar a un límite":

1. **Imágenes**: cada `<img>` de una post-card lleva `loading="lazy"` nativo del navegador — sin JS ni librería, las fotos fuera del viewport no se descargan hasta que se acercan.

2. **Posts**: `index.html` es la página 1 del feed, paginada con el plugin `jekyll-paginate` (`paginate: 12` en `_config.yml`, o sea 12 posts por "página"). Jekyll genera automáticamente `/page2/`, `/page3/`, etc. reusando el mismo `index.html` con un objeto `paginator` distinto cada vez — son páginas HTML completas y funcionales por sí solas (fallback sin JS: el link "Cargar más" al pie de cada página es una navegación normal a la siguiente).

   **Gotcha real, ya pisado una vez**: el archivo tiene que llamarse literalmente `index.html` (no `index.md`) — `jekyll-paginate` busca en `site.pages` una página cuyo `name` sea exactamente `index.html`, y eso se evalúa sobre el nombre del *archivo fuente*, no sobre la URL de salida. Con `index.md` el plugin no lo encuentra y build tira el warning silencioso "couldn't find an index.html page to use as the pagination template. Skipping pagination." (no falla el build, simplemente no pagina nada). Como este archivo no tiene sintaxis Markdown real — es puro Liquid/HTML (includes, `<section>`, `<script>`) — nombrarlo `.html` en vez de `.md` no cambia nada más: Jekyll simplemente no le corre kramdown encima (tampoco lo necesita).

   `assets/js/feed.js` mejora esto con infinite scroll: cuando el link "Cargar más" entra en el viewport (via `IntersectionObserver`), hace `fetch()` de la siguiente página, parsea su HTML con `DOMParser`, y le copia al `#feed` actual únicamente los hijos del `#feed` de la página bajada (ignora el resto del documento — header, footer, etc. de esa página fetcheada). Cada `#feed` lleva un atributo `data-next` con la URL (ya resuelta por `relurl.html`) de la próxima página; el JS lo va actualizando en cascada y saca el link "Cargar más" cuando ya no hay `data-next` (se acabaron los posts).

   Si se cambia el número de posts por página, solo hay que tocar `paginate:` en `_config.yml` — el resto (paginación estática y el infinite scroll) sigue funcionando igual.

**Importante**: `jekyll-paginate` solo pagina el `index.html` de la raíz del sitio — si en algún momento se agrega otra colección o listado paginado, no lo puede hacer este mismo plugin (haría falta `jekyll-paginate-v2`, que **no** está en la lista soportada por GitHub Pages, o resolverlo a mano).

**Otro gotcha ya pisado**: el filtro `date: "%B"` de Liquid (nombre completo del mes) sale en **inglés** sin importar `site.lang` — depende del locale del proceso Ruby, no de la config del sitio. `_includes/post-card.html` lo resuelve a mano con una tabla `_meses` (español, variante rioplatense: "setiembre" no "septiembre") indexada por `date: "%-m"`. Si se necesita formatear una fecha en español en algún otro lado (no solo en post-card), copiar ese mismo patrón — no usar `%B` directo.

## Header y tema

`_includes/header.html` muestra una foto circular de Isabella (`assets/img/isabella-header.jpg`) arriba del título del sitio, con `loading="lazy"`. Es una foto fija del sitio (chrome, no contenido de un post), por eso vive suelta en `assets/img/` y no bajo `assets/img/posts/` — para cambiarla, reemplazar ese archivo (mismo nombre) o actualizar la ruta en `header.html`.

La paleta vive toda en `assets/css/style.css` como custom properties en `:root` (light) y dentro de `@media (prefers-color-scheme: dark)` (dark) — tema rosa pastel, un solo lugar para tocar si se quiere ajustar el color.

También en el header, un `<p id="site-age">` muestra la edad actual de Isabella, calculada **client-side** por `assets/js/age.js` (no en build time — así siempre está al día sin depender de un rebuild, algo importante porque este sitio no tiene CI/cron, solo rebuildea con cada `git push`). La fecha de nacimiento (`2026-08-27T23:42:00-03:00`, hora de Montevideo) está hardcodeada en ese archivo — si hace falta tocarla, es el único lugar. Lógica de formato: mientras no cumplió 1 año muestra "X días"; a partir del primer cumpleaños, "N año(s)" o "N año(s) y M mes(es)" (omite "y 0 meses"). El `<p>` arranca vacío y `.site-age:empty { display: none }` en el CSS lo oculta si JS está deshabilitado, en vez de mostrar un hueco vacío.

## Feed RSS y SEO

- `jekyll-feed` genera `/feed.xml` automáticamente (linkeado desde el footer) — para que alguien de la familia lo siga sin depender de que se acuerde de visitar la página.
- `jekyll-sitemap` genera `/sitemap.xml`.
- `jekyll-seo-tag` (el `{% seo %}` en `_layouts/default.html`) genera meta tags Open Graph/Twitter Card automáticamente, usando `site.title`/`site.description` y, por página, `page.image` si está seteado — de ahí la convención de `image:` en el front matter de los posts (ver arriba).

## Gemfile / GitHub Pages

Mismo patrón que otros sitios del autor: `Gemfile` fija `jekyll` puro, no la gema `github-pages` — instalación local liviana, sin efecto en producción (GitHub Pages ignora el Gemfile y buildea con su propio entorno fijo). No agregar una gema de tema, un plugin custom, ni un workflow de GitHub Actions — la gracia de este setup es que `git push` solo ya rebuildea y despliega el sitio.

## Convenciones de trabajo

Sin definir todavía cuándo commitear/pushear — a diferencia de otros repos del autor, acá no hay una instrucción explícita registrada sobre esto. Preguntar si no está claro.
