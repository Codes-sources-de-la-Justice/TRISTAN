var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewEncapsulation, ViewChild, ElementRef, } from "@angular/core";
import ReactSummary from "../../containers/SummaryContainer";
import * as React from "react";
import * as ReactDOM from "react-dom";
const containerElementName = "ReactTristanSummary";
let Summary = class Summary {
    constructor() {
        Object.defineProperty(this, "containerRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "idj", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    ngOnChanges(changes) {
        this.render();
    }
    ngAfterViewInit() {
        this.render();
    }
    ngOnDestroy() {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }
    render() {
        if (!this.containerRef)
            return;
        const { idj } = this;
        // @ts-ignore
        ReactDOM.render(<ReactSummary idj={idj}/>, this.containerRef.nativeElement);
    }
};
__decorate([
    ViewChild(containerElementName, { static: false }),
    __metadata("design:type", ElementRef)
], Summary.prototype, "containerRef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Summary.prototype, "idj", void 0);
Summary = __decorate([
    Component({
        selector: "app-react-tristan-summary",
        template: `<div #${containerElementName}></div>`,
        styleUrls: ['assets/tristan/style.css'],
        encapsulation: ViewEncapsulation.ShadowDom,
    })
], Summary);
export default Summary;
