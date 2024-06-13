import {LitElement, html, css} from 'lit';
import {staticAssets} from 'build-time-data';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/split-layout';
import { columnBodyRenderer } from '@vaadin/grid/lit.js';

export class QwcWebBundlerOutput extends LitElement {

    static styles = css`
        :host {
            height: 100%;
            display: flex;
            padding-left: 10px;
        }
        .preview {
            display: flex;
            justify-content: center;
            padding: 50px 10px 10px;
        }
        .preview img{
            max-height: 100%;
            max-width: 100%;
        }
        master-content {
            min-width: 300px;
        }
        .linkOut {
            right: 15px;
            position: absolute;
            top: 5px;
            cursor: pointer;
        }
        vaadin-grid {
            height: 100%;
        }
    `;

    static properties = {
        _staticAssets: {},
        _selectedStaticAsset: {state: true},
        _selectedStaticAssetContent: {state: true}
    };

    constructor() {
        super();
        this._staticAssets = staticAssets;
        this._selectedStaticAsset = this._staticAssets[0]; // Select the first item by default
        this._selectedStaticAssetContent = null;
        this._fetchContent();
    }

    render() {
        return html`<vaadin-split-layout style="width: 100%;max-width: 100%;">
                        <master-content>${this._renderStaticAssets()}</master-content>
                        <detail-content>${this._renderAsset()}</detail-content>
                    </vaadin-split-layout>`;
    }

    _fetchContent() {
        if(this._selectedStaticAsset) {
            fetch(this._selectedStaticAsset.path)
                .then(r => r.text())
                .then(t => this._selectedStaticAssetContent = t);
        }

    }

    _renderStaticAssets(){
        return html`
            <vaadin-grid .items="${this._staticAssets}"
                            theme="compact no-border"
                            .selectedItems="${[this._selectedStaticAsset]}"    
                            @active-item-changed="${(e) => {
                                const item = e.detail.value;
                                if(item){
                                    this._selectedStaticAsset = item;
                                    this._fetchContent();
                                }
                            }}">
                <vaadin-grid-column ${columnBodyRenderer(this._renderPath, [])}></vaadin-grid-column>
                <vaadin-grid-column path="type" ></vaadin-grid-column>
            </vaadin-grid>`;
    }

    _renderPath(entryPoint) {
        return html`
            <code>${entryPoint.path}</code>
        `;
    }

    _renderAsset(){
        if(this._selectedStaticAsset){
            let fileType = this._getFileType(this._selectedStaticAsset.path);
            if (this._isImage(fileType)) {
                return html`<div class="preview">
                            <img src="${this._selectedStaticAsset.path}" alt="${this._selectedStaticAsset}"/>
                        </div>
                        ${this._renderLinkOut(this._selectedStaticAsset)}`;
            }
            if(this._selectedStaticAssetContent) {
                return html`<div class="codeBlock">
                            <qui-code-block
                                mode='${fileType}' 
                                content='${this._selectedStaticAssetContent}'>
                            </qui-code-block>
                        </div>`;
            } else {
                return html`<vaadin-progress-bar indeterminate></vaadin-progress-bar>`;
            }
        }
    }

    _isImage(fileType) {
        const imageExtensionsRegex = /^jpg|jpeg|png|gif|bmp|webp|ico|svg|tif|tiff|svg$/i;
        return imageExtensionsRegex.test(fileType);
    }

    _getFileType(filename) {
        let lastDotIndex = filename.lastIndexOf('.');

        if (lastDotIndex === -1 || lastDotIndex === 0) {
            return 'js'; // default
        } else {
            return filename.substring(lastDotIndex + 1);
        }
    }


    _renderLinkOut(staticAsset){
        return html`<vaadin-icon class="linkOut" 
                        icon="font-awesome-solid:up-right-from-square" 
                        @click=${() => {this._navigate(staticAsset.path)}}></vaadin-icon>`;
    }

    _navigate(link){
        window.open(link, '_blank').focus();
    }
}

customElements.define('qwc-web-bundler-output', QwcWebBundlerOutput)