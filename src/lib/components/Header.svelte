<script lang="ts">
  import { page } from '$app/state';
  let open = $state(false);
  const links = [['/now','Now'],['/photos','Photos'],['/log','Log'],['/about','About']];
</script>
<header class="site-header">
  <a class="wordmark" href="/">Westin Perry</a>
  <button class="menu" type="button" aria-expanded={open} aria-controls="site-nav" onclick={() => open=!open}>Menu</button>
  <nav id="site-nav" class:open aria-label="Main navigation">
    {#each links as link}<a href={link[0]} aria-current={page.url.pathname.startsWith(link[0])?'page':undefined} onclick={()=>open=false}>{link[1]}</a>{/each}
  </nav>
</header>
