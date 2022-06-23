import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from "@angular/core";
import * as TRISTAN from "@Codes-sources-de-la-justice/react-tristan";
import * as React from "react";
import * as ReactDOM from "react-dom";

const containerElementName = "ReactTristanSummary";

@Component({
  selector: "app-react-tristan-summary",
  template: `<div #${containerElementName}></div>`,
  styles: [``],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class SummaryComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(containerElementName, { static: false }) containerRef!: ElementRef;
  @Input() public idj: string | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  private render() {
    if (!this.containerRef) return;

    const shadowRoot = this.containerRef.nativeElement.getRootNode().host;
    const { idj } = this;

    ReactDOM.render(
      React.createElement(TRISTAN.SummaryContainer, { idj, shadowRoot }),
      this.containerRef.nativeElement
    );
  }
}
