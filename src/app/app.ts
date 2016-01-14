/// <reference path="../types/types.ts"/>

/* @ngInject */
function appConfig($mdThemingProvider: angular.material.IThemingProvider, ChartJsProvider) {
  let lightTextMap = $mdThemingProvider.extendPalette('light-green', {
  });
  $mdThemingProvider.definePalette('lightText', lightTextMap);
  $mdThemingProvider.theme('default')
    .primaryPalette('lightText')
    .accentPalette('yellow');
  $mdThemingProvider.theme('alternative')
    .primaryPalette('blue')
    .accentPalette('yellow')
    .dark();
  let formatNumber = function(value) {
    return '€' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  ChartJsProvider.setOptions({
    tooltipTemplate: function(label) {
      return formatNumber(label.value);
    },
    scaleLabel: function (valuePayload) {
      return formatNumber(Number(valuePayload.value));
    },
    scaleFontFamily: "'Roboto', sans-serif",
    tooltipFontFamily: "'Roboto', sans-serif",
    tooltipTitleFontFamily: "'Roboto', sans-serif",
    colours: ['#aaaaaa'],
    scaleLineColor: 'rgba(255,255,255,.3)',
    scaleFontColor: 'rgba(255,255,255,.7)',
    tooltipFillColor: '#3E3E3E',
    scaleGridLineColor: 'rgba(255,255,255,.2)'
  });
};

class CalculatorCtrl {
  /* @ngInject */
  constructor(
    private $scope: core.IRootScope
  ) {
    let scope = $scope;
    scope.pageTitle = 'ROI Calculator';
    scope.visits = 100000;
    scope.convRate = 10;
    scope.convRateOffline = 6;
    scope.orderValue = 100000;
    scope.visitsImp = 0;
    scope.convRateImp = 9;
    scope.convRateOfflineImp = 12;
    scope.orderValueImp = 13;
    let updateChartData = function() {
      let current = $scope.visits * 12 * $scope.convRate / 100 * $scope.convRateOffline / 100 * $scope.orderValue;
      $scope.data = [[current, current + $scope.visitsChange + $scope.convRateChange + $scope.orderValueChange + $scope.convRateOfflineChange]];
    };
    scope.$watch(function() {
      let incrVisits = scope.visits * scope.visitsImp / 100;
      return incrVisits * 12 * 0.05 * 50;
    }, function(newValue: number) {
      scope.visitsChange = newValue;
      updateChartData();
    });
    scope.$watch(function() {
      let incrConvRate = scope.convRate * scope.convRateImp / 100;
      return scope.visits * 12 * incrConvRate / 100 * scope.convRateOffline / 100 * scope.orderValue;
    }, function(newValue: number) {
      scope.convRateChange = newValue;
      updateChartData();
    });
    scope.$watch(function() {
        let incrConvOfflineRate = scope.convRateOffline * scope.convRateOfflineImp / 100;
        return scope.visits * 12 * incrConvOfflineRate / 100 * scope.convRate / 100 * scope.orderValue;
    }, function(newValue: number) {
        scope.convRateOfflineChange = newValue;
        updateChartData();
    });
    scope.$watch(function() {
      let incrOrderValue = scope.orderValue * scope.orderValueImp / 100;
      return scope.visits * 12 * (scope.convRate / 100) * (scope.convRateOffline / 100) * incrOrderValue;
    }, function(newValue: number) {
      scope.orderValueChange = newValue;
      updateChartData();
    });

    $scope.labels = ['Current State', 'Goal State'];
  }
};


angular.module('calculatorApp', [
  'templates',
  'ngMaterial',
  'chart.js'
])

.controller('CalculatorCtrl', CalculatorCtrl)

.config(appConfig);
