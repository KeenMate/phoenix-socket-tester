<script>
	import { channelManager } from '../socket/socketManager';
	import EventSender from './eventSender.svelte';
	import MessagesTable from './messagesTable.svelte';

	let socketUrl = 'ws://localhost:4000/ws/websocket?token=undefined&vsn=2.0.0',
		topic = 'helper_test:lobby',
		eventName;

	let manager;
	let store;
	function connect() {
		if (!socketUrl) {
			alert('socket url cant be null');
		}
		console.log({ socketUrl, topic });
		manager = new channelManager(socketUrl, topic);
		store = manager.store;
	}
</script>

<div class="container">
	<div class="row">
		<div class="col-6">
			<div>
				<h1>Socket connection</h1>
				<input bind:value={socketUrl} class="form-control" />
				<input bind:value={topic} class="form-control" />
				<button on:click={connect} class="btn btn-primary"> Connect</button>
			</div>
			{#if manager?.ready}
				<EventSender bind:manager />
			{/if}
		</div>
		<div class="col-6">
			{#if manager?.ready}
				<!-- {JSON.stringify($store)} -->
				<MessagesTable messages={$store} />
			{/if}
		</div>
	</div>
</div>
