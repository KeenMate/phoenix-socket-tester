<script>
  import { Multiselect } from "svelte-multiselect";
  import { getContext } from "svelte";
  import PayloadModal from "./payloadModal.svelte";

  const { open } = getContext("simple-modal");
  const showModal = (payload) => open(PayloadModal, { payload });

  function syntaxHighlight(json) {
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      }
    );
  }

  export let manager;
  let selectedTopics = [];

  $: topicsStore = manager.topicsStore;
  $: store = manager.store;
</script>

<div class="card">
  <div class="card-header"><h4>Messages</h4></div>
  <div class="card-body">
    <Multiselect
      multiple={true}
      bind:value={selectedTopics}
      options={$topicsStore}
      searchable={false}
      showLabels={false}
      placeholder="Select topics"
      trackBy="topic"
      label="topic"
    />
    <div class="table-wrapper">
      <table class="table table-striped overflow-hidden">
        <thead>
          <tr>
            <th class="compact" />
            <th class="compact">Topic</th>
            <th class="compact">Time</th>
            <th class="compact">event</th>
            <th class="compact">ref</th>
            <th class="compact">status</th>
            <th class="compact" />
            <th>payload</th>
          </tr>
        </thead>
        <tbody>
          {#each manager.filterMessages(selectedTopics, $store) as msg}
            <tr>
              <td>
                {#if msg.outgoing}
                  <i class="las la-long-arrow-alt-up" />
                {:else}
                  <i class="las la-long-arrow-alt-down" />
                {/if}
              </td>
              <td> {msg.topic}({msg.joinRef})</td>

              <!-- <td>{JSON.stringify(msg)}</td> -->
              <td>{msg.date.toLocaleTimeString("uk")}</td>
              <td
                class:text-danger={msg.event == "phx_error" ||
                  msg.event == "phx_close"}
                class:text-primary={msg.event == "phx_join"}
                class:text-success={msg.event == "phx_reply"}
                class:text-warning={msg.event == "phx_leave"}
              >
                <b>{msg.event}</b>
              </td>
              <td> {msg.ref}</td>
              <td>
                {msg.payload?.status ?? ""}
              </td>
              <td>
                <button
                  class="btn btn-sm btn-primary"
                  on:click={() => showModal(msg.payload)}
                >
                  <i class="las la-eye" /></button
                >
              </td>
              <td class="payload ">
                {#if msg.payload && Object.keys(msg.payload).length > 0}
                  {@html syntaxHighlight(JSON.stringify(msg.payload))}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style lang="scss">
  .payload {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    max-width: 1px;
  }

  .compact {
    width: 1px;
  }

  .table-wrapper {
    max-height: 80vh;
    overflow: auto;
    display: inline-block;
    width: 100%;
  }

  :global {
    .jsoneditor {
      height: 80vh;
    }
  }

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
