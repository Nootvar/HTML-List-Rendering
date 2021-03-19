export default class Renderer {
    private item: any;
    private renderedItem: string;

    constructor(item: any, template: string) {
        this.item = item;
        this.renderedItem = this.render(template);

    }

    public get renderResult(): string {
        return this.renderedItem;
    }

    private render(template: string): string {
        let renderedItem = this.renderConditions(template);
        renderedItem = this.renderProperties(renderedItem);
        return renderedItem;
    }

    private renderProperties(template: string): string {
        return template.replaceAll(/\{\{([^}]+)\}\}/g, (match: string, property: string) => {
            return this.getPropertyValue(property);
        });
    }

    private renderProperty(property: string) {
        
    }

    private renderConditions(template: string): string {
        return template.replaceAll(/{{if\(([^\)]+)\)}}(.+){{else}}(.+){{endif}}/gs, (match: string, property: string, subTemplate: string, elseSubTemplate) => {
            let value = this.getPropertyValue(property);
            if (value)
                return this.render(subTemplate);
            else
                return this.render(elseSubTemplate);
        }).replaceAll(/{{if\(([^\)]+)\)}}(.+){{endif}}/gs, (match: string, property: string, subTemplate: string) => {
            let value = this.getPropertyValue(property);
            if (value)
                return this.render(subTemplate);
            else
                return '';
        });
    }

    private getPropertyValue(propertyName: string): any {
        let split = propertyName.split('.');
        let value = this.item;
        split.forEach(key => {
            value = value ? value[key] : undefined;
        });
        return value;
    }
}