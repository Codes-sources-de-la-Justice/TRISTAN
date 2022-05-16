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
import ReactSummary from "../../containers/SummaryContainer";
import * as React from "react";
import * as ReactDOM from "react-dom";

const containerElementName = "ReactTristanSummary";

@Component({
  selector: "app-react-tristan-summary",
  template: `<div #${containerElementName}></div>`,
  styleUrls: [ 'assets/tristan/style.css' ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export default class Summary implements OnChanges, OnDestroy, AfterViewInit {
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

    const { idj } = this;
    // @ts-ignore
    ReactDOM.render(
      <ReactSummary idj={idj} />,
      this.containerRef.nativeElement
    );
  }
}
