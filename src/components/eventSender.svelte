<script>
	import { Multiselect } from 'svelte-multiselect';

	export let manager;

	let topicsStore = manager.topicsStore;
	let eventName, channel, payload;
	function send() {
		if (!channel) {
			alert('Topic not selected');
		}

		//validate json
		let json;
		try {
			json = JSON.parse(payload ?? '{}');
		} catch (e) {
			console.log(e);
			alert('invalid json');
		}

		manager.send(channel.topic, eventName);
	}
</script>

<div class="card mt-2">
	<div class="card-header">
		<h4>Send message</h4>
	</div>
	<div class="card-body">
		<div class="mb-3">
			<Multiselect
				bind:value={channel}
				options={$topicsStore.map((x) => x)}
				searchable={false}
				showLabels={false}
				placeholder="Select channel"
				class="mb-3"
				trackBy="topic"
				label="topic"
			/>
		</div>

		<div class="input-group mb-3">
			<input type="text" bind:value={eventName} class="form-control" placeholder="Event name"/>
			<button on:click={send} class="btn btn-primary">send</button>
		</div>
		<textarea bind:value={payload} cols="30" rows="10" class="form-control" placeholder="Payload" />
	</div>
</div>
