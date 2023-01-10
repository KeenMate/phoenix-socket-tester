<script>
	function syntaxHighlight(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
			function (match) {
				var cls = 'number';
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'key';
					} else {
						cls = 'string';
					}
				} else if (/true|false/.test(match)) {
					cls = 'boolean';
				} else if (/null/.test(match)) {
					cls = 'null';
				}
				return '<span class="' + cls + '">' + match + '</span>';
			}
		);
	}
	export let messages;
</script>

<table class="table table-striped">
	<tbody>
		{#each messages as message}
			<tr>
				<td>{message.date.toLocaleTimeString()}</td>
				<td> {message.type}</td>
				<td> {message.ref}</td>
				<td> {message.outgoing ? 'out' : 'in'}</td>
				<td>{@html syntaxHighlight(JSON.stringify(message.payload), null, 2)}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style lang="scss">
	:global(.string) {
		color: green;
	}
	:global(.number) {
		color: darkorange;
	}
	:global(.boolean) {
		color: blue;
	}
	:global(.null) {
		color: magenta;
	}
	:global(.key) {
		color: red;
	}
</style>
