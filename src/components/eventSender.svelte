<script>
	import { createEventDispatcher } from 'svelte';

	export let manager;

	let eventName, payload;
	function send() {
		try {
			manager.send(eventName, JSON.parse(payload ?? "{}"));
		} catch {
			alert('invalid json');
		}
	}
</script>

<div>
	<h1>Channel</h1>
	<button on:click={send} class="btn btn-primary"> PUSH</button>
	<input type="text" bind:value={eventName} class="form-control" />
	<br />
	<textarea bind:value={payload} cols="30" rows="10" class="form-control" />
</div>
