import { Socket } from 'phoenix';
import { writable } from 'svelte/store';
import { showSuccess, showError, showWarning } from '../helpers/notifications';

export class channelManager {
	constructor(socketUrl) {
		this.socket = new Socket(socketUrl);
		this.socket.connect();
		// this.channel = this.socket.channel(topic);

		this.socket.onMessage(this.handleMessage.bind(this));
		this.socket.logger = this.log;
		this.messages = {};
		this.store = new writable([]);
		this.topicsStore = new writable([]);
		// this.channel.join();
		this.ready = true;
		//TODO revork joinRefs and topic lookup
		this.joinRefs = {};
		this.topicsLookup = {};
	}

	addChannel(topic, params) {
		let channel = this.socket.channel(topic, params);
		//TODO manually leave channel if already connect to get leave push
		// if()
		this.joinChannel(channel);
		this.addChannelHandlers(topic, channel);
	}

	addChannelHandlers(topic, channel) {
		channel.onClose(() => showError(`${topic} channel closed`));
		channel.onError(() => showError(`${topic} channel error`));
		channel.on('leave', () => {
			this.addMessage(channel.joinRef(), 'phx_leave', {}, channel.joinPush.ref, true, topic);
			showWarning(`${topic} leaving  `);
		});
	}

	joinChannel(channel) {
		let joinPush = channel.join();

		joinPush
			.receive('ok', () => this.afterChannelJoin(joinPush.channel))
			.receive('error', ({ reason }) => showError(JSON.stringify(reason), 'Error joining'))
			.receive('timeout', () => showError('Timeout'));

		this.joinRefs[channel.topic] = channel.joinRef();
		this.topicsLookup[channel.joinRef()] = channel.topic;

		this.addMessage(channel.joinRef(), 'phx_join', {}, joinPush.ref, true, channel.topic);
	}

	afterChannelJoin(channel) {
		//join ref should be unqiue for given socket
		this.messages[channel.join_ref] = [];

		this.updateTopicsStore();
		showSuccess(`${channel.topic} channel joined`);
	}

	updateTopicsStore() {
		let channels = Object.keys(this.joinRefs).map((x) => {
			return { ref: this.joinRefs[x], topic: x };
		});
		this.topicsStore.set(channels);
	}

	getJoinRef(topic) {
		return this.joinRefs[topic];
	}

	getTopic(ref) {
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
		//add to messages
		this.addMessage(
			data.join_ref,
			data.event,
			data.payload,
			data.ref,
			false,
			this.getTopic(data.join_ref)
		);
		return data;
	}

	log(type, event, payload) {
		console.debug(type, event, payload);
		// let splitted = event.split(" ")
	}

	send(topic, eventName, payload) {
		let channel = this.getChannel(this.getJoinRef(topic));

		if (!channel) {
			throw 'channel with given topic is not joined';
		}

		let push = channel.push(eventName, payload, 10000);

		this.addMessage(this.getJoinRef(topic), eventName, push.payload(), push.ref, true, topic);
	}

	getChannel(joinRef) {
		return this.socket.channels.find((x) => x.joinRef() == joinRef);
	}

	addMessage(joinRef, event, payload, ref, outgoing, topic) {
		let message = {
			joinRef: joinRef,
			event,
			payload,
			date: new Date(),
			ref,
			outgoing,
			topic: topic
		};

		if (!this.messages[joinRef]) this.messages[joinRef] = [];
		this.messages[joinRef ?? 'no_join_ref'].push(message);

		console.debug(message);
		//update store to force rerender
		this.store.set(this.messages);
	}

	filterMessages(topics) {
		let refs = topics.map((x) => x.ref);

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
