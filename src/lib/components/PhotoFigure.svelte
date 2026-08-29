<script lang="ts">
  import PhotoImage from './PhotoImage.svelte'; import { dateLabel } from '$lib/format'; import type { Photo } from '$lib/server/models';
  let { photo, onopen } = $props<{photo:Photo;onopen?:(photo:Photo)=>void}>();
</script>
<figure><a class="photo-link" href={`/photos/${photo.id}`} aria-label={`Open photo${photo.caption?`: ${photo.caption}`:''}`} onclick={(event)=>{if(onopen){event.preventDefault();onopen(photo);}}}><PhotoImage {photo}/></a><figcaption><time datetime={photo.display_date?new Date(photo.display_date).toISOString():undefined}>{dateLabel(photo.display_date)}</time>{#if photo.caption}<p>{photo.caption}</p>{/if}</figcaption></figure>
