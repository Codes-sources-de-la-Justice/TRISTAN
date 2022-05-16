import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from "@angular/core";
import { v1 } from "uuid";
import ReactSummary from "../../containers/SummaryContainer";
import * as React from "react";
import * as ReactDOM from "react-dom";

const containerElementName = "ReactTristanSummary";

@Component({
  selector: "app-react-tristan-summary",
  template: `<div #${containerElementName}></div>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export default class Summary implements OnChanges, OnDestroy, AfterViewInit {
  private rootDomID!: string;
  protected getRootDomNode() {
    // @ts-ignore
    const node = document.getElementById(this.rootDomID);
    //invariant(node, `Node '${this.rootDomID} not found!`);
    return node;
  }
  private isMounted(): boolean {
    return !!this.rootDomID;
  }
  @Input() public idj: string | undefined;

  ngOnInit() {
    this.rootDomID = v1();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this.rootDomID);
  }

  private render() {
    if (this.isMounted()) {
      const { idj } = this;
      // @ts-ignore
      console.log("TRISTAN React Render", idj, this.containerRef.nativeElement);
      ReactDOM.render(<ReactSummary idj={idj} />, this.rootDomID);
    }
  }
}
