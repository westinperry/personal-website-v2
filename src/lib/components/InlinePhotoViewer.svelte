<script lang="ts">
  import PhotoImage from './PhotoImage.svelte';
  import {dateLabel} from '$lib/format';
  import type {Photo} from '$lib/server/models';

  let {photo,photos,onclose,onmove}=$props<{photo:Photo;photos:Photo[];onclose:()=>void;onmove:(step:number)=>void}>();
</script>

<article class="inline-photo-viewer" role="region" aria-label="Expanded photo" data-photo-id={photo.id} data-collection-size={photos.length}>
  <button class="close" type="button" aria-label="Close expanded photo" onclick={onclose}>Close ×</button>
  <figure>
    <div class="inline-photo-image">{#key photo.id}<span class="inline-photo-image-frame"><PhotoImage {photo} eager/></span>{/key}</div>
    <figcaption>
      <time datetime={photo.display_date?new Date(photo.display_date).toISOString():undefined}>{dateLabel(photo.display_date)}</time>
      {#if photo.caption}<h2>{photo.caption}</h2>{/if}
      {#if photo.note}<p>{photo.note}</p>{/if}
      {#if photo.place}<p class="meta">{photo.place}</p>{/if}
      {#if photo.album_name}<p class="meta">Album — {photo.album_name}</p>{/if}
    </figcaption>
  </figure>
  <nav class="inline-photo-nav" aria-label="Photo navigation">
    <button class="subtle" type="button" disabled={photos[0]?.id===photo.id} onclick={()=>onmove(-1)}>← Previous</button>
    <button class="subtle" type="button" disabled={photos[photos.length-1]?.id===photo.id} onclick={()=>onmove(1)}>Next →</button>
  </nav>
</article>
