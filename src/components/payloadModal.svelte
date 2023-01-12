<script>
	import 'jsoneditor/dist/jsoneditor.min.css';
	import JSONEditor from 'jsoneditor';
	import { onMount } from 'svelte';

	export let payload;

	onMount(() => createEditor());

	let editor, editorContainer;
	function createEditor() {
		editor = new JSONEditor(editorContainer, { mode: 'view' });
		editor.set(payload);
		editor.expandAll();
	}
</script>

<div>
	<div class="edit-container" bind:this={editorContainer} />
</div>
