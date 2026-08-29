<script lang="ts">
  import {goto} from '$app/navigation';
  import {onMount,tick} from 'svelte';
  import InlinePhotoViewer from '$lib/components/InlinePhotoViewer.svelte';
  import PhotoImage from '$lib/components/PhotoImage.svelte';
  import PhotoFigure from '$lib/components/PhotoFigure.svelte';
  import ScrollCue from '$lib/components/ScrollCue.svelte';
  import type {Photo} from '$lib/server/models';

  type AlbumBundle={id:number;name:string;photos:Photo[]};

  let {data}=$props();
  let selected=$state<Photo|null>(null);
  let activePhotos=$state<Photo[]>([]);
  let anchorKey=$state<string|null>(null);
  let activeAlbumId=$state<number|null>(null);
  let rotationStep=$state(0);
  let albumOffsets=$state<Record<number,number>>({});
  let albumBundles=$derived.by(()=>{
    const bundles=new Map<number,AlbumBundle>();
    for(const photo of data.photos){
      if(!photo.album_id||!photo.album_name)continue;
      const bundle=bundles.get(photo.album_id)??{id:photo.album_id,name:photo.album_name,photos:[]};
      bundle.photos.push(photo);
      bundles.set(photo.album_id,bundle);
    }
    for(const bundle of bundles.values())bundle.photos.sort((a,b)=>{const aTime=a.display_date?new Date(a.display_date).getTime():Number.POSITIVE_INFINITY;const bTime=b.display_date?new Date(b.display_date).getTime():Number.POSITIVE_INFINITY;return aTime-bTime||a.id-b.id;});
    return [...bundles.values()];
  });

  const query=(view:string,sort=data.order==='ASC'?'oldest':'newest')=>`?view=${view}&sort=${sort}`;
  const previewAt=(bundle:AlbumBundle,step:number)=>bundle.photos[((step+(albumOffsets[bundle.id]??0))%bundle.photos.length+bundle.photos.length)%bundle.photos.length];
  const previewPhoto=(bundle:AlbumBundle)=>previewAt(bundle,rotationStep);
  const previousPreviewPhoto=(bundle:AlbumBundle)=>previewAt(bundle,rotationStep-1);
  function resetViewer(){selected=null;activePhotos=[];anchorKey=null;activeAlbumId=null;}
  function changeView(event:MouseEvent,view:string){event.preventDefault();resetViewer();goto(query(view),{noScroll:true,keepFocus:true});}
  function changeSort(value:string){resetViewer();goto(query(data.view,value),{noScroll:true,keepFocus:true});}
  async function reveal(photo:Photo,photos:Photo[],anchor:string,albumId:number|null=null){selected=photo;activePhotos=photos;anchorKey=anchor;activeAlbumId=albumId;await tick();const viewer=document.querySelector<HTMLElement>('.inline-photo-viewer');viewer?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});viewer?.querySelector<HTMLElement>('.close')?.focus({preventScroll:true});}
  function openPhoto(photo:Photo){return reveal(photo,data.photos,`photo-${photo.id}`);}
  function openAlbum(bundle:AlbumBundle){return reveal(bundle.photos[0],bundle.photos,`album-${bundle.id}`,bundle.id);}
  async function closePhoto(){
    const lastPhoto=selected;
    const albumId=activeAlbumId;
    if(albumId&&lastPhoto){
      const bundle=albumBundles.find((item)=>item.id===albumId);
      const index=bundle?.photos.findIndex((photo)=>photo.id===lastPhoto.id)??0;
      albumOffsets={...albumOffsets,[albumId]:index-rotationStep};
    }
    resetViewer();
    await tick();
    const target=albumId
      ?document.querySelector<HTMLElement>(`[data-album-id="${albumId}"] .album-bundle`)
      :document.querySelector<HTMLElement>(`[data-photo-id="${lastPhoto?.id}"] .photo-link`);
    target?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    target?.focus({preventScroll:true});
  }
  function move(step:number){if(!selected)return;const index=activePhotos.findIndex((photo)=>photo.id===selected?.id);const next=activePhotos[index+step];if(next)selected=next;}
  function keys(event:KeyboardEvent){if(!selected)return;if(event.key==='Escape'){event.preventDefault();closePhoto();}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}}
  onMount(()=>{window.addEventListener('keydown',keys);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const rotation=reduced?undefined:window.setInterval(()=>rotationStep+=1,5500);return()=>{window.removeEventListener('keydown',keys);if(rotation)window.clearInterval(rotation);};});
</script>

<svelte:head><title>Photos — Westin Perry</title><meta name="description" content="A record of places and moments."/></svelte:head>

<section class="page-intro split-intro opening-screen photos-intro">
  <div><p class="eyebrow">Photos</p><h1>A record of<br/>places and moments.</h1><p>Captured on the road, at home, and in between. This is my visual log.</p></div>
  <div class="editorial-image">{#if data.settings.photo_hero_key}<PhotoImage photo={{storage_key:data.settings.photo_hero_key,alt_text:data.settings.photo_hero_alt}} eager/>{:else}<div class="image-fallback">Add a photo-page hero in Private</div>{/if}</div>
  <ScrollCue target="photo-gallery"/>
</section>

<nav class="controls" id="photo-gallery" aria-label="Photo gallery controls">
  <a class:active={data.view==='all'} href={query('all')} onclick={(event)=>changeView(event,'all')}>All Photos</a>
  <a class:active={data.view==='albums'} href={query('albums')} onclick={(event)=>changeView(event,'albums')}>Albums</a>
  <a class:active={data.view==='places'} href={query('places')} onclick={(event)=>changeView(event,'places')}>Places</a>
  <label class="sort">Sort<select value={data.order==='ASC'?'oldest':'newest'} onchange={(event)=>changeSort((event.currentTarget as HTMLSelectElement).value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
</nav>

{#if data.view==='albums'}
  <div class="section-head"><h2>Albums</h2><span class="meta">{albumBundles.length} collections</span></div>
  {#if albumBundles.length}
    <div class="photo-grid album-grid">
      {#each albumBundles as bundle (bundle.id)}
        <div class="photo-cell" class:is-expanded={anchorKey===`album-${bundle.id}`} data-album-id={bundle.id}>
          {#if selected&&anchorKey===`album-${bundle.id}`}
            <InlinePhotoViewer photo={selected} photos={activePhotos} onclose={closePhoto} onmove={move}/>
          {:else}
            <button class="album-bundle" type="button" aria-label={`Open album ${bundle.name}, ${bundle.photos.length} photos`} data-photo-count={bundle.photos.length} data-first-photo-id={bundle.photos[0].id} data-preview-id={previewPhoto(bundle).id} onclick={()=>openAlbum(bundle)}>
              <span class="album-stack" aria-hidden="true"><span class="album-frame album-frame-previous"><PhotoImage photo={previousPreviewPhoto(bundle)}/></span>{#key previewPhoto(bundle).id}<span class="album-frame album-frame-current"><PhotoImage photo={previewPhoto(bundle)}/></span>{/key}</span>
              <span class="album-label"><strong>{bundle.name}</strong><span>{bundle.photos.length} photo{bundle.photos.length===1?'':'s'}</span></span>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="meta">No albums yet.</p>
  {/if}
{:else}
  {#if data.view==='places'}<div class="section-head"><h2>Places</h2><span class="meta">{new Set(data.photos.map((photo:Photo)=>photo.place).filter(Boolean)).size} places</span></div>{/if}
  <div class="photo-grid">
    {#each data.photos as photo (photo.id)}
      <div class="photo-cell" class:is-expanded={anchorKey===`photo-${photo.id}`} data-photo-id={photo.id}>
        {#if selected&&anchorKey===`photo-${photo.id}`}
          <InlinePhotoViewer photo={selected} photos={activePhotos} onclose={closePhoto} onmove={move}/>
        {:else}
          {#if data.view==='places'&&photo.place}<p class="eyebrow">{photo.place}</p>{/if}
          <PhotoFigure {photo} onopen={openPhoto}/>
        {/if}
      </div>
    {/each}
  </div>
{/if}
