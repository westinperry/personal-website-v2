import {test,expect} from '@playwright/test';

test('every public page begins with one viewport-height opening screen',async({page})=>{
  const pages=[['/','home-content'],['/now','now-content'],['/photos','photo-gallery'],['/log','log-content'],['/about','about-content']];
  for(const viewport of [{width:1280,height:800},{width:500,height:800}]){
    await page.setViewportSize(viewport);
    for(const [route,target] of pages){
      await page.goto(route);
      const opening=page.locator('.opening-screen');
      const headerHeight=await page.locator('.site-header').evaluate((node)=>node.getBoundingClientRect().height);
      const openingHeight=await opening.evaluate((node)=>node.getBoundingClientRect().height);
      expect(Math.abs(openingHeight-(viewport.height-headerHeight))).toBeLessThan(2);
      expect(await opening.evaluate((node)=>node.scrollHeight<=node.clientHeight+1)).toBe(true);
      const cue=page.getByRole('link',{name:'Scroll'});
      await expect(cue).toBeVisible();
      await expect(cue).toHaveAttribute('href',`#${target}`);
      await cue.click();
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
      await expect(cue).toBeHidden();
      await page.evaluate(()=>scrollTo(0,0));
      await expect(cue).toBeVisible();
    }
  }
});

test('public archive and inline photo gallery render accessibly',async({page})=>{
  await page.setViewportSize({width:1280,height:900});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Westin Perry'})).toBeVisible();
  await expect(page.locator('.site-header .wordmark')).toBeVisible();
  await expect(page.getByRole('link',{name:'Private'})).toHaveCount(0);
  await expect(page.locator('.photo-grid figure')).toHaveCount(3);
  const headerHeight=await page.locator('.site-header').evaluate((node)=>node.getBoundingClientRect().height);
  const heroHeight=await page.locator('.hero').evaluate((node)=>node.getBoundingClientRect().height);
  expect(Math.abs(heroHeight-(900-headerHeight))).toBeLessThan(2);
  expect(await page.locator('.photo-grid').first().evaluate((node)=>getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(3);
  await expect(page.locator('.hero')).toHaveAttribute('data-hydrated','true');
  for(let click=0;click<6;click++)await page.locator('.secret-entry').click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading',{name:'Welcome back.'})).toBeVisible();

  await page.setViewportSize({width:1368,height:796});
  await page.goto('/photos');
  const intro=page.locator('.photos-intro');
  expect(parseFloat(await intro.evaluate((node)=>getComputedStyle(node).paddingTop))).toBeLessThanOrEqual(50);
  expect((await intro.locator('.editorial-image').boundingBox())?.height).toBeLessThanOrEqual(541);
  const photosHeaderHeight=await page.locator('.site-header').evaluate((node)=>node.getBoundingClientRect().height);
  const introBox=await intro.boundingBox();
  expect(Math.abs((introBox?.height??0)-(796-photosHeaderHeight))).toBeLessThan(2);
  const introCopy=await page.getByText('Captured on the road, at home, and in between. This is my visual log.').boundingBox();
  expect(introCopy&&introCopy.y+introCopy.height).toBeLessThan(796);
  const scrollCue=page.getByRole('link',{name:'Scroll'});
  await expect(scrollCue).toBeVisible();
  await scrollCue.click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);

  const ratios=await page.locator('.photo-grid img').evaluateAll((images)=>images.map((image)=>Math.round((Number(image.getAttribute('width'))/Number(image.getAttribute('height')))*100)));
  expect(new Set(ratios).size).toBeGreaterThanOrEqual(3);
  const cells=page.locator('.photo-cell');
  const secondTopBefore=((await cells.nth(1).boundingBox())?.y??0)+await page.evaluate(()=>scrollY);
  await page.locator('.photo-link').first().hover();
  expect(await page.locator('.photo-link img').first().evaluate((image)=>getComputedStyle(image).transform)).not.toBe('none');
  const galleryUrl=page.url();
  await page.locator('.photo-link').first().click();
  const viewer=page.getByRole('region',{name:'Expanded photo'});
  await expect(viewer).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Close expanded photo'})).toBeFocused();
  await expect(cells.first()).toHaveClass(/is-expanded/);
  expect(((await cells.nth(1).boundingBox())?.y??0)+await page.evaluate(()=>scrollY)).toBeGreaterThan(secondTopBefore+100);
  expect(page.url()).toBe(galleryUrl);
  await expect.poll(async()=>{const box=await viewer.boundingBox();return Boolean(box&&box.y>=-1&&box.y+box.height<=797);}).toBe(true);
  expect(await viewer.evaluate((node)=>getComputedStyle(node).overflow)).toBe('hidden');
  expect(await viewer.locator('figure').evaluate((node)=>getComputedStyle(node).overflow)).toBe('hidden');
  expect(parseFloat(await viewer.evaluate((node)=>getComputedStyle(node).paddingTop))).toBeLessThanOrEqual(32);
  const imageFits=await viewer.locator('figure').evaluate((figure)=>{const image=figure.querySelector('img')!.getBoundingClientRect();const box=figure.getBoundingClientRect();return image.left>=box.left-1&&image.right<=box.right+1&&image.top>=box.top-1&&image.bottom<=box.bottom+1;});
  expect(imageFits).toBe(true);
  const viewerBox=await viewer.boundingBox();
  const navBox=await viewer.locator('.inline-photo-nav').boundingBox();
  const navBottomOffset=(viewerBox?.y??0)+(viewerBox?.height??0)-((navBox?.y??0)+(navBox?.height??0));
  const first=await viewer.locator('img').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  await expect.poll(()=>viewer.locator('img').getAttribute('src')).not.toBe(first);
  expect(parseFloat(await viewer.locator('.inline-photo-image-frame').evaluate((node)=>getComputedStyle(node).animationDuration))).toBeGreaterThanOrEqual(.4);
  const lastPhotoId=await viewer.getAttribute('data-photo-id');
  const nextViewerBox=await viewer.boundingBox();
  const nextNavBox=await viewer.locator('.inline-photo-nav').boundingBox();
  expect(Math.abs(((nextViewerBox?.y??0)+(nextViewerBox?.height??0)-((nextNavBox?.y??0)+(nextNavBox?.height??0)))-navBottomOffset)).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  const lastThumbnail=page.locator(`[data-photo-id="${lastPhotoId}"] .photo-link`);
  await expect(lastThumbnail).toBeFocused();
  await expect.poll(async()=>{const box=await lastThumbnail.boundingBox();return Boolean(box&&Math.abs(box.y+box.height/2-398)<3);}).toBe(true);

  const scrollBefore=await page.evaluate(()=>scrollY);
  await page.getByRole('link',{name:'Albums'}).click();
  await expect(page).toHaveURL(/view=albums/);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(Math.min(100,scrollBefore-10));
  const bundles=page.locator('.album-bundle');
  const bundleCount=await bundles.count();
  if(bundleCount){
    const firstBundle=bundles.first();
    const collectionSize=Number(await firstBundle.getAttribute('data-photo-count'));
    const firstPhotoId=await firstBundle.getAttribute('data-first-photo-id');
    if(collectionSize>1){const preview=await firstBundle.getAttribute('data-preview-id');await expect.poll(()=>firstBundle.getAttribute('data-preview-id'),{timeout:7000}).not.toBe(preview);await expect(firstBundle.locator('.album-frame')).toHaveCount(2);expect(parseFloat(await firstBundle.locator('.album-frame-current').evaluate((node)=>getComputedStyle(node).animationDuration))).toBeGreaterThanOrEqual(.7);}
    await firstBundle.click();
    const albumViewer=page.getByRole('region',{name:'Expanded photo'});
    await expect(albumViewer).toBeVisible();
    await expect(albumViewer).toHaveAttribute('data-photo-id',String(firstPhotoId));
    await expect(albumViewer).toHaveAttribute('data-collection-size',String(collectionSize));
    await page.keyboard.press('Escape');
    await expect(albumViewer).not.toBeVisible();
    await expect(firstBundle).toBeFocused();
    await expect.poll(async()=>{const box=await firstBundle.boundingBox();return Boolean(box&&Math.abs(box.y+box.height/2-398)<3);}).toBe(true);
  }

  await page.getByRole('link',{name:'All Photos'}).click();
  await expect(page).toHaveURL(/view=all/);
  await expect(page.locator('.album-grid')).toHaveCount(0);
  await page.setViewportSize({width:700,height:900});
  const mobileHeaderHeight=await page.locator('.site-header').evaluate((node)=>node.getBoundingClientRect().height);
  expect(Math.abs((await intro.evaluate((node)=>node.getBoundingClientRect().height))-(900-mobileHeaderHeight))).toBeLessThan(2);
  expect(await page.locator('.photo-grid').evaluate((node)=>getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  await page.setViewportSize({width:500,height:900});
  expect(await page.locator('.photo-grid').evaluate((node)=>getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);

  await page.goto('/about');
  for(const label of ['Instagram','X','LinkedIn']){
    const socialLinks=page.getByRole('link',{name:label,exact:true});
    await expect(socialLinks.first()).toBeVisible();
    for(const link of await socialLinks.all())await expect(link).toHaveAttribute('target','_blank');
  }
  await page.goto('/admin');
  await expect(page.getByRole('heading',{name:'Welcome back.'})).toBeVisible();
});
