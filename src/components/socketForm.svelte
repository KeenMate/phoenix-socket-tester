<script>
	import { channelManager } from '../socket/socketManager';
	import EventSender from './eventSender.svelte';
	import MessagesTable from './messagesTable.svelte';
	import { showWarning, showSuccess } from '../helpers/notifications';
	import Modal from 'svelte-simple-modal';

	let socketUrl = 'ws://localhost:4000/ws/websocket?token=undefined&vsn=2.0.0',
		topic = 'helper_test:lobby';

	let manager;
	let socketConnected = false;
	let topicsStore;
	async function connect() {
		manager = new channelManager(socketUrl, () => {
			manager = null;
			showWarning('Socket closed');
		});
		await manager.connectSocket();
		showSuccess('Socket connected');
		socketConnected = true;
		topicsStore = manager.topicsStore;
	}

	async function disconnect() {
		socketConnected = false;
		await manager.disconnectSocket();
		manager = null;
	}

	function joinChannel() {
		manager.addChannel(topic);
	}
</script>

<Modal>
	<div class="mx-3">
		<div class="row">
			<div class="col-6">
				<div class="card ">
					<div
						class="card-header text-white "
						class:bg-success={socketConnected}
						class:bg-warning={manager && !socketConnected}
						class:bg-danger={!socketConnected}
					>
						<h4>Connections</h4>
					</div>
					<div class="card-body">
						<div>
							<h4>Socket connection</h4>
							<div class="input-group">
								<input bind:value={socketUrl} class="form-control" />
								{#if !manager}
									<button on:click={connect} class="btn btn-success"> Connect </button>
								{:else}
									<button on:click={disconnect} class="btn btn-danger"> Disconnect </button>
								{/if}
							</div>
						</div>
						<h4>Channels</h4>

						<div class="input-group">
							<input bind:value={topic} class="form-control" />
							<button on:click={joinChannel} class="btn btn-success" disabled={!socketConnected}>
								Join</button
							>
						</div>

						{#if socketConnected}
							<ul>
								{#each $topicsStore as channel}
									<li>{channel.topic}</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				{#if socketConnected}
					<EventSender bind:manager />
				{/if}
			</div>
			<div class="col-6">
				{#if socketConnected}
					<!-- {JSON.stringify($store)} -->
					<MessagesTable bind:manager />
				{/if}
			</div>
		</div>
	</div>
</Modal>
