<script>
  import { Multiselect } from "svelte-multiselect";
  import templateManager from "../storage/templateManager";

  let namespace = null;
  let namespaces;
  loadNamespaces();

  export let eventName, payload;

  function loadNamespaces() {
    namespaces = templateManager.getNamespaces() ?? [];
  }
  function updateSelectedNamespace() {
    loadNamespaces();
    namespace = namespaces.find((n) => n.key == namespace?.key);
  }
  function addNamespace(e) {
    let name = e.detail;
    templateManager.createNamespace(name);
    namespace = { key: name, templates: {} };
    loadNamespaces();
  }
  function deleteNamespace() {
    templateManager.deleteNamespace(namespace.key);
    namespace = null;
    loadNamespaces();
  }

  let template;
  //also use as create template
  function saveTemplate() {
    doSaveTemplate(template.key);
  }

  function doSaveTemplate(templateKey) {
    let templateToSave = { event: eventName, payload };

    templateManager.save(namespace.key, templateKey, templateToSave);

    updateSelectedNamespace();
    template = namespace.templates[templateKey];
  }
  function createTemplate({ detail: templateKey }) {
    doSaveTemplate(templateKey);
  }
  function deleteTemplate() {
    if (!namespace || !template) return;
    templateManager.deleteTemplate(namespace.key, template.key);

    template = null;
    updateSelectedNamespace();
  }
  function applyTemplate() {
    eventName = template.template.event;
    payload = template.template.payload ?? {};
  }

  // $: console.log(namespace);
  // $: console.log(namespaces);
  // $: console.log(template);
</script>

<div class="card  mb-3">
  <div class="card-header bg-info">
    <h2>{namespace?.key ?? "No"} namespace</h2>
  </div>

  <div class="card-body">
    <div class="d-flex mb-3">
      <!-- svelte-ignore missing-declaration -->
      <Multiselect
        bind:value={namespace}
        options={namespaces}
        taggable={true}
        on:tag={addNamespace}
        trackBy="key"
        on:input={() => (template = null)}
        tagPlaceholder="Create new nameplace"
        placeholder="Select namespace or create new "
        label="key"
      />
      <button
        on:click={deleteNamespace}
        class="btn btn-danger"
        disabled={!namespace}
      >
        <i class="las la-trash" />
      </button>
    </div>
    {#if namespace}
      <div class="d-flex mb-3">
        <!-- svelte-ignore missing-declaration -->

        <Multiselect
          bind:value={template}
          options={Object.values(namespace.templates ?? {})}
          taggable={true}
          on:tag={createTemplate}
          on:input={() => setTimeout(() => applyTemplate())}
          trackBy="key"
          tagPlaceholder="create new template"
          placeholder="Select namespace or create new "
          label="key"
        />
        <button
          on:click={deleteTemplate}
          class="btn btn-danger"
          disabled={!namespace}
        >
          <i class="las la-trash" />
        </button>
        <button
          on:click={saveTemplate}
          class="btn btn-success"
          disabled={!namespace}
        >
          <i class="las la-save" />
        </button>
        <button
          on:click={applyTemplate}
          class="btn btn-info"
          disabled={!namespace}
        >
          <i class="las la-play" />
        </button>
      </div>
    {/if}
  </div>
</div>
