/// <reference path="../libs/angularjs/angular.d.ts"/>

declare module core {

  interface IRootScope extends ng.IScope {
    pageTitle: string;
    visits: number;
    convRate: number;
    convRateOffline: number;
    orderValue: number;
    visitsImp: number;
    convRateImp: number;
    convRateOfflineImp: number;
    orderValueImp: number;
    visitsChange: number;
    convRateChange: number;
    convRateOfflineChange: number;
    orderValueChange: number;
    labels: any;
    data: any;
  }
}
