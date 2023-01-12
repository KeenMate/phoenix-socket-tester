<script>
	import 'jsoneditor/dist/jsoneditor.min.css';
	import JSONEditor from 'jsoneditor';
	import { onMount } from 'svelte';

	export let payload;

	onMount(() => createEditor());

	let editor, editorContainer;
	function createEditor() {
		editor = new JSONEditor(editorContainer, { mode: 'code' });
		editor.set(payload);
	}
</script>

<div>
	<div class="edit-container" bind:this={editorContainer} />
</div>
