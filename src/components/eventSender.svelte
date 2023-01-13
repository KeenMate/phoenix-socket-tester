<script>
  import { onMount } from "svelte";
  import { Multiselect } from "svelte-multiselect";
  import "jsoneditor/dist/jsoneditor.min.css";
  import JSONEditor from "jsoneditor";
  import { showError } from "../helpers/notifications";

  export let manager;

  let topicsStore = manager.topicsStore;
  export let eventName = "";
  export let channel = null;
  export let payload = {};

  let editorContainer;
  let editor;
  function send() {
    if (!channel) {
      alert("Topic not selected");
    }

    //validate json
    let json;
    try {
      json = editor.get() ?? {};
    } catch (e) {
      console.log(e);
      showError("invalid json");
    }

    manager.send(channel.topic, eventName, json);
  }

  onMount(() => {
    editor = new JSONEditor(editorContainer, {
      mode: "code",
      onChange: () => tryChange(),
    });
  });

  //TODO this probably wont work, have hadnle change batter
  //BAD binding
  function tryChange() {
    let json;
    try {
      json = editor.get();
      payload = json;
    } catch (e) {
      //
    }
  }

  function payloadChange(p) {
    try {
      let oldVal = editor?.get();
      if (JSON.stringify(p) == JSON.stringify(oldVal)) {
        return;
      }
      editor?.set(p);
    } catch (e) {
      console.error("payload is invalid js");
    }
  }

  $: editor && payloadChange(payload);
</script>

<div class="card mt-2">
  <div class="card-header">
    <h4>Send message</h4>
  </div>
  <div class="card-body">
    <div class="mb-3">
      <Multiselect
        bind:value={channel}
        options={$topicsStore.map((x) => x)}
        searchable={false}
        showLabels={false}
        placeholder="Select channel"
        class="mb-3"
        trackBy="topic"
        label="topic"
      />
    </div>

    <div class="input-group mb-3">
      <input
        type="text"
        bind:value={eventName}
        class="form-control"
        placeholder="Event name"
      />
      <button
        on:click={send}
        class="btn btn-primary"
        disabled={!channel && !eventName}>send</button
      >
    </div>
    <div class="edit-container" bind:this={editorContainer} />
    <!-- <textarea bind:value={payload} cols="30" rows="10" class="form-control" placeholder="Payload" /> -->
  </div>
</div>
