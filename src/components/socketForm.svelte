<script>
	import { channelManager } from '../socket/socketManager';
	import EventSender from './eventSender.svelte';
	import MessagesTable from './messagesTable.svelte';

	let socketUrl = 'ws://localhost:4000/ws/websocket?token=undefined&vsn=2.0.0',
		topic = 'helper_test:lobby',
		eventName;

	let manager;
	let store;
	let topicsStore;
	function connect() {
		if (!socketUrl) {
			alert('socket url cant be null');
		}

		manager = new channelManager(socketUrl);
		store = manager.store;
		topicsStore = manager.topicsStore;
	}

	function joinChannel() {
		manager.addChannel(topic);
	}
</script>

<div class="mx-3">
	<div class="row">
		<div class="col-6">
			<div class="card ">
				<div class="card-header  bg-success text-white">
					<h4>Connections</h4>
				</div>
				<div class="card-body">
					<div>
						<h4>Socket connection</h4>
						<div class="input-group">
							<input bind:value={socketUrl} class="form-control" />
							<button on:click={connect} class="btn btn-success" disabled={manager}>
								Connect
							</button>
						</div>
					</div>
					<h4>Channels</h4>
					{#if manager?.ready}
						<ul>
							{#each $topicsStore as channel}
								<li>{channel.topic}</li>
							{/each}
						</ul>
					{/if}
					<div class="input-group">
						<input bind:value={topic} class="form-control" />
						<button on:click={joinChannel} class="btn btn-success" disabled={!manager}>
							Join</button
						>
					</div>
				</div>
			</div>

			{#if manager?.ready}
				<EventSender bind:manager />
			{/if}
		</div>
		<div class="col-6">
			{#if manager?.ready}
				<!-- {JSON.stringify($store)} -->
				<MessagesTable bind:manager/>
			{/if}
		</div>
	</div>
</div>
