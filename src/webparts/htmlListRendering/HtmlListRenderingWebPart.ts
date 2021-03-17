import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'HtmlListRenderingWebPartStrings';
import HtmlListRendering, { HtmlListRenderingProps } from './components/HtmlListRendering';

import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldCodeEditor, PropertyFieldCodeEditorLanguages } from '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor';
import { PropertyFieldViewPicker, PropertyFieldViewPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldViewPicker';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";

export interface IHtmlListRenderingWebPartProps {
  list: string;
  view: string;
  header: string;
  template: string;
  log: boolean;
  size: number;
}

export default class HtmlListRenderingWebPart extends BaseClientSideWebPart<IHtmlListRenderingWebPartProps> {

  public render(): void {
    const element: React.ReactElement<HtmlListRenderingProps> = React.createElement(
      HtmlListRendering,
      {
        list: this.properties.list,
        view: this.properties.view,
        header: this.properties.header,
        template: this.properties.template,
        log: this.properties.log,
        size: this.properties.size
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    sp.setup({
      spfxContext: this.context
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  // @ts-ignore
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Select a list and optionally a view. You can log the items returned in the console using \'Log items\'. The container for the rendered items is flex. Access the item properties using {{PropertyName.SubPropertyName}}.'
          },
          groups: [
            {
              groupName: 'List settings',
              groupFields: [
                PropertyFieldListPicker('list', {
                  label: 'Select the list',
                  selectedList: this.properties.list,
                  includeHidden: true,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  key: 'list'
                }),
                PropertyFieldViewPicker('view', {
                  label: 'Select the view',
                  listId: this.properties.list,
                  selectedView: this.properties.view,
                  orderBy: PropertyFieldViewPickerOrderBy.Title,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  key: 'view'
                }),
                PropertyPaneCheckbox('log', {
                  text: 'Log items'
                })
              ]
            },
            {
              groupName: 'Template settings',
              groupFields: [
                PropertyFieldCodeEditor('header', {
                  label: 'Header',
                  panelTitle: 'Edit HTML Code for the header',
                  initialValue: this.properties.header,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  key: 'header',
                  language: PropertyFieldCodeEditorLanguages.HTML
                }),
                PropertyFieldCodeEditor('template', {
                  label: 'Template',
                  panelTitle: 'Edit HTML Code for the items template',
                  initialValue: this.properties.template,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  key: 'template',
                  language: PropertyFieldCodeEditorLanguages.HTML
                }),
                PropertyPaneSlider('size', {
                  label: 'Size override (in %)',
                  min: 100,
                  max: 200,
                  step: 5
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
