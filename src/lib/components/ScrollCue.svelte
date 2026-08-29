<script lang="ts">
  import {onMount} from 'svelte';
  let {target}: {target:string} = $props();
  let visible=$state(true);
  onMount(()=>{const update=()=>visible=window.scrollY<8;update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);});
</script>

<a class="scroll-cue" class:is-hidden={!visible} href={`#${target}`} aria-hidden={!visible} tabindex={visible?0:-1}><span>Scroll</span><span aria-hidden="true">↓</span></a>
