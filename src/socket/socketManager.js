import { Socket } from 'phoenix';
import { writable } from 'svelte/store';
export class channelManager {
	constructor(socketUrl, topic) {
		this.socket = new Socket(socketUrl);
		this.socket.connect();
		this.channel = this.socket.channel(topic);
		this.messages = [];
		this.store = new writable([]);
		this.channel.socket.onMessage(this.handleMessage.bind(this));
		this.channel.join();
		this.ready = true;
	}

	handleMessage(data) {
		if (!data.join_ref) {
			return data;
		}
		console.debug({ message: data });
		//add to messages
		this.addMessage(data.event, data.payload, data.ref, false);
		return data;
	}

	send(eventName, payload) {
		let push = this.channel.push(eventName, payload, 10000);
		console.log({ push });
		this.addMessage(eventName, push.payload(), push.ref, true);
	}

	addMessage(type, payload, ref, outgoing) {
		this.messages.push({ type, payload, date: new Date(), ref, outgoing });
		this.store.set(this.messages);
	}
}
