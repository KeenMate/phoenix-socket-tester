import { Socket } from 'phoenix';
import { writable } from 'svelte/store';
import { wait } from '../helpers/helper';
import { showSuccess, showError, showWarning } from '../helpers/notifications';

export class channelManager {
	constructor(socketUrl, connClosedCallback) {
		this.socket = new Socket(socketUrl);

		this.socket.onMessage(this.handleMessage.bind(this));
		this.socket.logger = this.log.bind(this);

		//internal variable for messages
		this.messages = {};
		this.store = new writable([]);
		this.topicsStore = new writable([]);

		this.socket.onClose = connClosedCallback;

		this.topicsLookup = {};
	}

	connectSocket() {
		return new Promise((resolve) => {
			this.socket.connect();
			this.socket.onOpen(() => {
				this.ready = true;
				resolve();
			});
		});
	}

	disconnectSocket(){
		return new Promise((resolve) => {
			this.socket.disconnect(() => {
				this.ready = false;
				resolve();
			});
		});
	}

	async addChannel(topic, params) {
		let oldChannel = this.socket.channels.find((channel) => channel.topic == topic);

		let channel = this.socket.channel(topic, params);

		//manually leave ca
		if (oldChannel) {
			let oldChannelRef = oldChannel.joinRef();
			let leavePush = oldChannel.leave();

			this.addMessage(
				{
					joinRef: oldChannelRef,
					event: 'phx_leave',
					payload: {},
					ref: leavePush.ref,
					topic
				},
				true
			);

			//! this timeout is here to force correct message order
			await wait(1000);
		}

		this.joinChannel(topic, channel);
	}

	addChannelHandlers(topic, channel) {
		channel.onClose(() => showWarning(`${topic} channel closed`));
		channel.onError(() => showError(`${topic} channel error`));
	}

	joinChannel(topic, channel) {
		let joinPush = channel.join();
		this.addChannelHandlers(topic, channel);

		joinPush
			.receive('ok', () => this.afterChannelJoin(joinPush.channel))
			.receive('error', this.handleErrorJoining)
			.receive('timeout', () => showError('Timeout'));

		this.topicsLookup[channel.joinRef()] = channel.topic;
	}

	handleErrorJoining(er) {
		console.log(er);
		showError(JSON.stringify(er), 'Error joining');
	}

	afterChannelJoin(channel) {
		//join ref should be unqiue for given socket
		this.messages[channel.join_ref] = [];
		this.updateTopicsStore();
		showSuccess(`${channel.topic} channel joined`);
	}

	updateTopicsStore() {
		let topics = this.socket.channels.map((channel) => {
			return { ref: channel.joinRef(), topic: channel.topic };
		});

		topics.forEach((topic) => (this.topicsLookup[topic.ref] = topic.topic));

		this.topicsStore.set(topics);
	}

	getTopic(ref) {
		if (!this.topicsLookup[ref]) {
			this.updateTopicsStore();
		}
		return this.topicsLookup[ref];
	}

	/**
	 * handle receive message
	 * @param {*} data
	 * @returns
	 */
	handleMessage(data) {
		if (!data.join_ref) {
			return data;
		}

		data.joinRef = data.join_ref;
		data.topic = this.getTopic(data.join_ref);
		//add to messages
		this.addMessage(data, false);
		return data;
	}

	log(type, event, payload) {
		console.debug(type, event, payload);

		//TODO make better
		if (!event && typeof event !== 'string') {
			return;
		}

		let splittedEvent = event?.split(' ');
		console.log(splittedEvent, splittedEvent?.length);
		//catch phx_join
		if (type == 'push' && splittedEvent?.length >= 3 && splittedEvent[1] == 'phx_join') {
			let topic = splittedEvent[0];
			console.log('IN');
			let r = /\d+/;
			let ref = splittedEvent[2].match(r);

			this.addMessage(
				{
					joinRef: ref,
					event: 'phx_join',
					payload,
					ref: ref,
					topic
				},
				true
			);
		}
	}

	send(topic, eventName, payload) {
		let channel = this.getChannel(topic);

		let push = channel.push(eventName, payload, 10000);

		this.addMessage(
			{
				joinRef: channel.joinRef(),
				event: eventName,
				payload: push.payload(),
				ref: push.ref,
				topic
			},
			true
		);
	}

	getChannel(topic) {
		let channel = this.socket.channels.find((x) => x.topic == topic);
		if (!channel) {
			throw 'channel with given topic is not joined';
		}
		return channel;
	}

	addMessage(message, outgoing) {
		message.date = new Date();
		message.outgoing = outgoing;
		let joinRef = message.joinRef;
		if (!this.messages[joinRef]) this.messages[joinRef] = [];
		this.messages[joinRef ?? 'no_join_ref'].push(message);

		//update store to force rerender
		this.store.set(this.messages);
	}

	filterMessages(topics) {
		//get all refs that have given topics
		//this is to get messages in that channel ig it closed
		let refs = Object.keys(this.topicsLookup).filter((key) =>
			topics.map((x) => x.topic).includes(this.topicsLookup[key])
		);

		let messagesArrays = Object.keys(this.messages)
			.filter((key) => refs.includes(key))
			.map((key) => this.messages[key]);

		if (!refs.length) {
			messagesArrays = Object.values(this.messages);
		}

		return this.joinMessages(messagesArrays ?? this.messages);
	}

	getAllMessages() {
		return this.joinMessages(this.messages);
	}

	joinMessages(channelMessages) {
		return [].concat
			.apply([], [...channelMessages])
			.sort((a, b) => new Date(b.date) - new Date(a.date));
	}
}
