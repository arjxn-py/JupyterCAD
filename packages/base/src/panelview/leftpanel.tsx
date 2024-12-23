import {
  JupyterCadDoc,
  IJupyterCadTracker,
  IJCadFormSchemaRegistry,
  IJupyterCadModel
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
import { ControlPanelHeader } from './header';
import { ObjectTree } from './objecttree';
import { ObjectProperties } from './objectproperties';
import { AccordionPanel } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';

export class LeftPanelWidget extends SidePanel {
  constructor(options: LeftPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this.addClass('data-jcad-keybinding');
    this.node.tabIndex = 0;
    this._model = options.model;
    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    const tree = new ObjectTree({ controlPanelModel: this._model });
    this.addWidget(tree);

    const properties = new ObjectProperties({
      controlPanelModel: this._model,
      formSchemaRegistry: options.formSchemaRegistry,
      tracker: options.tracker
    });
    this.addWidget(properties);

    this._handleFileChange = () => {
      header.title.label = this._currentContext?.localPath || '-';
    };

    options.tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        if (this._currentContext) {
          this._currentContext.pathChanged.disconnect(this._handleFileChange);
        }
        this._currentContext = changed.context;
        header.title.label = changed.context.localPath;
        this._currentContext.pathChanged.connect(this._handleFileChange);
      } else {
        header.title.label = '-';
        this._currentContext = null;
      }
    });
    (this.content as AccordionPanel).setRelativeSizes([4, 6]);
  }

  dispose(): void {
    super.dispose();
  }

  private _currentContext: DocumentRegistry.IContext<IJupyterCadModel> | null;
  private _handleFileChange: () => void;
  private _model: IControlPanelModel;
}

export namespace LeftPanelWidget {
  export interface IOptions {
    model: IControlPanelModel;
    tracker: IJupyterCadTracker;
    formSchemaRegistry: IJCadFormSchemaRegistry;
  }

  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
