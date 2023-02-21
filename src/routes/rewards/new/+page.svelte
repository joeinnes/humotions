<script lang="ts">
  import { pb } from '$lib/db/db';
  import { toastStore } from '@skeletonlabs/skeleton';
  let name = '';
  let link = '';
  const addReward = async () => {
		const data = {
			name,
			link,
			created_by: pb.authStore.model.id,
		};
		
		const record = await pb.collection('reward_links').create(data);
		toastStore.trigger({
			message: 'Reward created',
			preset: 'success',
			duration: '5000'
		});
		goto('/');
	};
</script>

<section class="card py-8 px-4 flex flex-col gap-2">
	<label>
		<h3>Name</h3>
		<input
			bind:value={name}
			class="w-full border rounded focus:outline-none p-2 bg-surface-50"
		/>
	</label>
  <label>
		<h3>Link</h3>
		<input
			bind:value={link}
			class="w-full border rounded focus:outline-none p-2 bg-surface-50"
		/>
	</label>
	<button
		on:click={addReward}
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded mt-4"
		>Save</button
	>
</section>
