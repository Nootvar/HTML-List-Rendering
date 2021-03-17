import * as React from 'react';
import styles from './HtmlListRendering.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import "@pnp/sp/items";

import "ts-replace-all";
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';

export interface HtmlListRenderingProps {
  list: string;
  view: string;
  header: string;
  template: string;
  log: boolean;
  size: number;
}

interface HtmlListRenderingState {
  items: any[];
}

export default class HtmlListRendering extends React.Component<HtmlListRenderingProps, HtmlListRenderingState> {
  private list: string;
  private view: string;
  private log: boolean;

  constructor(props: HtmlListRenderingProps) {
    super(props);

    this.list = props.list;
    this.view = props.view;
    this.log = props.log;

    this.state = { items: [] };

    this.refreshItems = this.refreshItems.bind(this);

    this.refreshItems();
  }

  public render(): React.ReactElement<HtmlListRenderingProps> {
    let items = this.state.items.map(item => this.renderItem(item));
    let size = this.props.size || 100;

    return (
      <div className={styles.htmlListRendering} style={{width: `${size}%`}}>
        {this.props.header && this.props.header !== '' &&
          <div className={styles.header} dangerouslySetInnerHTML={{ __html: this.props.header }}>
          </div>
        }
        <div className={styles.container} dangerouslySetInnerHTML={{ __html: items.join('') }}>
        </div>
      </div>
    );
  }

  public componentDidUpdate() {
    if (this.props.list !== this.list || this.props.view !== this.view || this.props.log !== this.log) {
      this.list = this.props.list;
      this.view = this.props.view;
      this.log = this.props.log;
      this.refreshItems();
    }
  }

  private async refreshItems(): Promise<void> {
    if (this.props.list && this.props.template) {
      let items: any[];
      if (Environment.type === EnvironmentType.Local)
        items = await this.getMockItems();
      else
        items = await this.getItems();

      if (this.props.log && items.length > 0)
        console.log(items);
      this.setState({ items: items });
    }
    else
      this.setState({ items: [] });
  }

  private async getItems(): Promise<any[]> {
    let { list, view } = this.props;

    if (this.props.view) {
      let query = (await sp.web.lists.getById(list).views.getById(view).select('ViewQuery').get()).ViewQuery;
      let xml = '<View><Query>' + query + '</Query></View>';
      return await sp.web.lists.getById(list).getItemsByCAMLQuery({ 'ViewXml': xml });
    }
    else
      return await sp.web.lists.getById(this.props.list).items.get();
  }

  private async getMockItems(): Promise<any[]> {
    return Promise.resolve([
      { Title: 'one', One: { Two: { Three: 'here one' } } },
      { Title: 'two', One: { Two: { Three: 'here two' } } },
      { Title: 'three', One: { Two: { Three: 'here three' } } },
      { Title: 'four', One: { Two: { Three: 'here four' } } }
    ]);
  }

  private renderItem(item: any): string {
    return this.props.template.replaceAll(/\{\{([^}]+)\}\}/g, (match: string, property: string) => {
      let split = property.split('.');
      let value = item;
      split.forEach(key => {
        value = value ? value[key] : undefined;
      });
      return value;
    });
  }
}
