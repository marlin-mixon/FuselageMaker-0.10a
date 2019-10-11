'use strict';

/* Directives */

angular.module('fuselageMaker.directives', [])
  .directive('draggable', ['$document', function($document) {
    return {
      restrict: 'A',
      scope: {
        dragObj: '=',
        dragSubEl: '@',
        dragIndex: '@',
        getScaledPointFunc: '=',
        sst2: '=',
        arc: '=',
        scale: '=',
        color: '='
      },
      require: '?^svgZarc',
      // require: '^svgZarc',
      link: function(scope, element, attr) {
        var startX = 0, startY = 0, x = 0, y = 0, x0 = 0, y0 = 0;

        element.css({
         position: 'relative',
         cursor: 'pointer'
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          var point = scope.getScaledPointFunc(event.clientX, event.clientY, scope.scale);
          startX = point.x;
          startY = point.y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
          scope.sst2.is_drag = true
          
          scope.sst2.drobj1 = scope.dragObj[+scope.dragIndex][scope.dragSubEl];
           
        });

        function draggify(x, y, index, point1, point2, point3, point4) {
          point1.x = x;
          point1.y = y;
          scope.$apply();
        }

        function mousemove(event) {
          var point = scope.getScaledPointFunc(event.clientX, event.clientY, scope.scale);
          x = point.x;
          y = point.y;
          element.css({
            top:  y + 'px',
            left: x + 'px'
          });
          //console.log(element.css('transform'));
          //console.log('x='+x+', y='+y);
          draggify(x, y, scope.dragIndex, scope.sst2.drobj1, scope.sst2.drobj2, 
                                                 scope.sst2.drobj3, scope.sst2.drobj4);
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    };
  }]).directive('svgZarc', [ function() {
    return {
      restrict: 'A',
      scope: {
        zarcObj: '=',
        scale: '=',
        isActive: '=',
        color: '@',
        getScaledPointFunc: '=',
        sst2: '='
      },
      controller: function($scope) {
        $scope.select_zarc = function(ix, obj) {
          obj.is_selected = true;
          obj.selected_element = ix;
        }

      },
      templateUrl: 'partials/svgZarc.html'
    }
  }]);
