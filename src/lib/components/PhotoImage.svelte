<script lang="ts">
  let { photo, eager=false, class:className='' } = $props<{photo:{storage_key:string;alt_text?:string|null;width?:number|null;height?:number|null};eager?:boolean;class?:string}>();
  let failed=$state(false);
</script>
{#if failed}<div class="image-fallback" role="img" aria-label={photo.alt_text??'Image unavailable'}>Image unavailable</div>{:else}<img class={className} src={`/media/${encodeURIComponent(photo.storage_key)}`} alt={photo.alt_text??''} width={photo.width??undefined} height={photo.height??undefined} loading={eager?'eager':'lazy'} fetchpriority={eager?'high':'auto'} onerror={()=>failed=true} />{/if}
