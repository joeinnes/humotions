<script lang="ts">
  import { onMount } from 'svelte'
	import { pb } from '$lib/db/db';
  let records = [];
  onMount(async () => {
    records = await pb.collection('reward_links').getFullList(200, {
      sort: 'name',
    });
  })
</script>

<div class="flex flex-col gap-2 mb-4">
{#each records as record}
  <a class="btn variant-filled-secondary" href={record.link} target="_blank" rel="external noreferrer">{record.name}</a>
{/each}
</div>

<!--<button class="btn variant-filled-primary"><span>&plus;</span>
  <span>Add new reward</span>
</button>-->
