export type Namespace = {
  key: string;
  templates: {
    [key: string]: WrappedTemplate;
  };
};
export type WrappedTemplate = {
  key: string;
  template: Template;
};
export type Template = {
  event: string;
  payload: object;
};

export class TemplateManager {
  constructor() {}

  getNamespace(namespace: string): Namespace {
    try {
      return JSON.parse(window.localStorage.getItem(namespace));
    } catch (e) {
      localStorage.setItem(namespace, "{}");
    }
  }

  setNamespace(namespace: string, templates: Namespace) {
    window.localStorage.setItem(namespace, JSON.stringify(templates));

    console.log(this.getNamespace(namespace));
  }

  getNamespaces(): Array<Namespace> {
    let namespaces = [];
    for (let index = 0; index < window.localStorage.length; index++) {
      let key = window.localStorage.key(index);
      namespaces.push(this.getNamespace(key));
    }

    return namespaces;
  }

  deleteNamespace(namespace: string): void {
    localStorage.removeItem(namespace);
  }

  createNamespace(namespace: string): void {
    this.setNamespace(namespace, { key: namespace, templates: {} });
  }

  get(namespace: string, key: string): WrappedTemplate {
    return this.getNamespace(namespace)[key];
  }

  save(namespaceName: string, key: string, template: Template): void {
    let namespace = this.getNamespace(namespaceName);
    namespace.templates[key] = { key, template };
    this.setNamespace(namespaceName, namespace);
  }
  deleteTemplate(namespace: string, key: string): void {
    let namespaceTemplates = this.getNamespace(namespace);
    delete namespaceTemplates.templates[key];
    console.log(namespaceTemplates);
    this.setNamespace(namespace, namespaceTemplates);
  }
}

export default new TemplateManager();
